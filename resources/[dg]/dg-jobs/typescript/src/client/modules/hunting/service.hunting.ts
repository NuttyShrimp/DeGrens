import { Notifications, PolyZone, Util, Weapons, Phone, Peek, Events, Inventory } from '@dgx/client';
import { TIME_TO_KILL_ANIMAL, TIME_TO_LEAVE_AREA } from './constants.hunting';
import { doBaitPlaceAnim } from './helpers.hunting';
import { overrideDensitySettings, resetDensitySettings } from './zone.hunting';

let doingHuntingJob = false;

// is true when bait has been placed but awaiting animal spawn
let baitPlaced = false;
let currentAnimal: number | null = null;

let huntingZonesBuilt = false;
let inHuntingZone = false;
let phoneNotifId = 0;

export const isDoingHuntingJob = () => doingHuntingJob;

export const startHuntingJob = () => {
  if (doingHuntingJob) return;
  Phone.addMail({
    subject: 'Jagen',
    sender: 'Jan Ger',
    message:
      'Je bent nu bevoegd om te jagen in de jaaggebieden rondt Chiliad Mountain State Wilderness. Ik koop enkel huiden van everzwijnen, herten, coyotes en poemas.',
  });
  doingHuntingJob = true;
  overrideDensitySettings();
};

export const buildHuntingZones = (huntingZones: Hunting.Config['huntingZones']) => {
  if (huntingZonesBuilt) return;

  for (const idx in huntingZones) {
    PolyZone.addPolyZone('jobs_huntingzone', huntingZones[idx], {
      data: {
        id: idx,
      },
      minZ: 1,
      maxZ: 200,
      routingBucket: 0,
    });
  }
  huntingZonesBuilt = true;
};

const destroyHuntingZones = () => {
  if (!huntingZonesBuilt) return;
  PolyZone.removeZone('jobs_huntingzone');
  huntingZonesBuilt = false;
};

export const enteredHuntingZone = () => {
  inHuntingZone = true;
  Phone.showNotification({
    id: `hunting_entered_zone_${phoneNotifId++}`,
    title: `Jagen`,
    description: 'Je bent nu in een jaaggebied',
    icon: 'jobcenter',
  });
};

export const leftHuntingZone = () => {
  inHuntingZone = false;
  Phone.showNotification({
    id: `hunting_left_zone_${phoneNotifId++}`,
    title: `Jagen`,
    description: 'Jaaggebied verlaten',
    icon: 'jobcenter',
  });
};

export const placeBait = async (itemId: string, animalModel: string) => {
  if (!inHuntingZone) {
    Notifications.add('Je bent niet in een jaaggebied', 'error');
    return;
  }

  if (baitPlaced || (currentAnimal && DoesEntityExist(NetworkGetEntityFromNetworkId(currentAnimal)))) {
    Notifications.add('Je hebt nog lokaas liggen', 'error');
    return;
  }

  baitPlaced = true;

  const removed = await Inventory.removeItemById(itemId);
  if (!removed) {
    baitPlaced = false;
    Notifications.add('Je hebt geen lokaas', 'error');
    return;
  }

  Weapons.removeWeapon(undefined, true);

  await doBaitPlaceAnim();

  Notifications.add('Ga op een afstandje staan zodat je het dier niet afschrikt', 'info');
  spawnAnimal(animalModel);
};

export const canLootAnimal = (animal: number) => {
  return IsEntityDead(animal) && NetworkGetEntityIsNetworked(animal) && isDoingHuntingJob();
};

const lootAnimal = async (animal: number) => {
  if (!canLootAnimal(animal)) return;

  const cause = GetPedCauseOfDeath(animal) >>> 0;
  // WEAPON_FALL is the cause when using SetEntityHealth to kill ped
  if (cause !== GetHashKey('WEAPON_FALL') >>> 0) {
    Notifications.add('Dit dier is niet bruikbaar, heb je wel je jachtgeweer gebruikt?', 'error');
    return;
  }

  Weapons.removeWeapon(undefined, true);

  const ped = PlayerPedId();
  await Util.loadAnimDict('amb@medic@standing@kneel@base');
  await Util.loadAnimDict('anim@gangops@facility@servers@bodysearch@');
  TaskPlayAnim(ped, 'amb@medic@standing@kneel@base', 'base', 2.0, -2.0, -1, 1, 0, false, false, false);
  TaskPlayAnim(
    ped,
    'anim@gangops@facility@servers@bodysearch@',
    'player_search',
    2.0,
    -2.0,
    -1,
    48,
    0,
    false,
    false,
    false
  );
  await Util.Delay(5000);
  ClearPedTasks(ped);

  Events.emitNet('jobs:hunting:loot', NetworkGetNetworkIdFromEntity(animal));
};

export const cleanupHuntingJob = () => {
  doingHuntingJob = false;
  currentAnimal = null;
  baitPlaced = false;
  destroyHuntingZones();
  resetDensitySettings();
};

export const spawnAnimal = async (animalModel: string) => {
  const baitPosition = Util.getPlyCoords();

  // wait till player has left area
  const hasLeftArea = await new Promise<boolean>(res => {
    let timeoutCounter = TIME_TO_LEAVE_AREA;
    const thread = setInterval(() => {
      if (timeoutCounter <= 0) {
        res(false);
        clearInterval(thread);
        return;
      }

      const plyPos = Util.getPlyCoords();
      if (baitPosition.distance(plyPos) > 40) {
        res(true);
        clearInterval(thread);
        return;
      }

      timeoutCounter--;
    }, 1000);
  });

  if (!hasLeftArea) {
    Notifications.add('Er is geen dier naar je lokaas gekomen omdat je te dicht stond', 'error');
    baitPlaced = false;
    return;
  }

  // Confirm and wait random amount
  Notifications.add('Je staat ver genoeg zo, wacht tot er een dier naar je lokaas komt', 'info');
  await Util.Delay(Util.getRndInteger(10, 20));

  // Get cur coords, angle & distance from baitpos
  const plyCoords = Util.getPlyCoords();
  let baitToPlyAngle = Math.atan2(plyCoords.y - baitPosition.y, plyCoords.x - baitPosition.x);
  baitToPlyAngle = baitToPlyAngle < 0 ? baitToPlyAngle + 2 * Math.PI : baitToPlyAngle; // 0-2PI for comparison later on
  const distance = plyCoords.distance(baitPosition);

  // Choosing spawn position
  let animalSpawnPosition: Vec3 | null = null;
  let triesRemaining = 25;
  let triedAngles = new Set<number>([0]);
  while (animalSpawnPosition === null) {
    // Choose random angle but avoid angles we already tested
    let randomAngle = 0;
    while (triedAngles.has(randomAngle)) {
      randomAngle = Util.getRndInteger(-60, 60);
    }
    triedAngles.add(randomAngle);

    // Calculate spawn pos based on mirrored angle and random angle
    const choosenAngle = baitToPlyAngle + Math.PI + randomAngle * (Math.PI / 180);
    const randomCoords: Vec3 = {
      x: baitPosition.x + distance * Math.cos(choosenAngle),
      y: baitPosition.y + distance * Math.sin(choosenAngle),
      z: 0,
    };

    // get ground pos for choosen coord
    let [_, groundZ] = GetGroundZFor_3dCoord(randomCoords.x, randomCoords.y, 150, false);
    randomCoords.z = groundZ ?? 100;

    let hasLos = true;

    // Check if camheading is close to angle between baitpos & playpos.
    // this means we not lookin at possible spawn positions
    let camHeading = GetGameplayCamRot(0)[2];
    camHeading = camHeading < 0 ? camHeading + 360 : camHeading;
    const angleToCompare = baitToPlyAngle * (180 / Math.PI) - 90; // gta 90 deg offset yeeee KANKER DING MAN
    if (camHeading > angleToCompare - 60 && camHeading < angleToCompare + 60) {
      hasLos = false;
    }

    // Only do raycast if we still have los after cam check
    if (hasLos) {
      const rayHandle = StartExpensiveSynchronousShapeTestLosProbe(
        plyCoords.x,
        plyCoords.y,
        plyCoords.z,
        randomCoords.x,
        randomCoords.y,
        randomCoords.z,
        -1,
        PlayerPedId(),
        0
      );
      hasLos = !GetShapeTestResult(rayHandle)[1]; // value at idx 1 is if anything was hit
    }

    if (!hasLos || triesRemaining <= 0) {
      animalSpawnPosition = randomCoords;
    }

    triesRemaining--;
  }

  // We keep using networkgetentityfromnetid, because entity id might change during this step
  const { netId, entity } = await Util.createPedOnServer(animalModel, animalSpawnPosition, undefined, {
    fromBait: true,
  });
  baitPlaced = false;
  if (!netId || !entity) return;

  currentAnimal = netId;
  let spawnedAnimal = entity;

  SetPedAsNoLongerNeeded(spawnedAnimal);
  TaskSetBlockingOfNonTemporaryEvents(spawnedAnimal, false);
  setTimeout(() => {
    TaskFollowNavMeshToCoord(spawnedAnimal, baitPosition.x, baitPosition.y, baitPosition.z, 1, -1, 0, true, 0);
  }, 500);

  const animalBlip = AddBlipForEntity(spawnedAnimal);
  SetBlipSprite(animalBlip, 141);
  SetBlipColour(animalBlip, 6);
  SetBlipScale(animalBlip, 0.9);

  // wait till animal is at bait
  await Util.awaitCondition(() => {
    if (!currentAnimal) return true;
    const animal = NetworkGetEntityFromNetworkId(currentAnimal);
    if (!DoesEntityExist(animal)) return false;
    return baitPosition.distance(Util.getEntityCoords(animal)) < 3 || IsEntityDead(animal);
  }, 180000);

  // Check if animal still exists
  spawnedAnimal = NetworkGetEntityFromNetworkId(currentAnimal);
  if (!currentAnimal || !DoesEntityExist(spawnedAnimal) || IsEntityDead(spawnedAnimal)) {
    currentAnimal = null;
    return;
  }

  ClearPedTasks(spawnedAnimal);
  SetPedKeepTask(spawnedAnimal, false);
  TaskWanderStandard(spawnedAnimal, 10.0, 10);

  // timeout to not get softlocked
  setTimeout(
    netId => {
      if (currentAnimal === netId) {
        currentAnimal = null;
      }
    },
    TIME_TO_KILL_ANIMAL,
    currentAnimal
  );
};

export const registerHuntingAnimalPeekEntries = (animalConfig: Hunting.Config['animals']) => {
  const models = animalConfig.map(a => GetHashKey(a.model));
  Peek.addModelEntry(models, {
    options: [
      {
        label: 'Villen',
        icon: 'fas fa-knife',
        action: (_, entity) => {
          if (!entity) return;
          lootAnimal(entity);
        },
        canInteract: entity => {
          if (!entity) return false;
          return canLootAnimal(entity);
        },
      },
    ],
    distance: 2,
  });
};
