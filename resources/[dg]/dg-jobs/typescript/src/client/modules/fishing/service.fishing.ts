import {
  PolyZone,
  UI,
  Keys,
  Events,
  Notifications,
  Peek,
  RayCast,
  Util,
  PropAttach,
  Minigames,
  RPC,
  Phone,
  Animations,
} from '@dgx/client';

let inReturnZone = false;

let fishingLocation: Vec3 | null = null;
let fishingLocationBlip: number | null = null;

let fishingVehicle: number | null = null;
let vehiclePeekIds: string[] = [];

let currentJobType: Fishing.JobType | null = null;

let fishingRodProp: number | null = null;
let fishEntity: number | null = null;
let fishHoldAnimLoopId: number | null = null;

export const setCurrentJobType = (jobType: typeof currentJobType) => {
  currentJobType = jobType;
};

export const buildFishingReturnZone = (fishingReturnZone: Fishing.Config['vehicle']) => {
  for (const [jobType, returnZone] of Object.entries(fishingReturnZone)) {
    const { w: heading, ...coords } = returnZone.coords;
    PolyZone.addBoxZone('fishing_return', coords, returnZone.size, returnZone.size, {
      heading,
      minZ: coords.z - 2,
      maxZ: coords.z + 6,
      data: {
        id: jobType,
      },
    });
  }
};

export const setInReturnZone = (isIn: boolean, jobType: Fishing.JobType) => {
  if (isIn && currentJobType === jobType) {
    inReturnZone = true;
    if (IsPedInAnyVehicle(PlayerPedId(), false)) {
      UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Afleveren`);
    }
  } else {
    inReturnZone = false;
    UI.hideInteraction();
  }
};

export const setFishingVehicle = (netId: typeof fishingVehicle) => {
  if (fishingVehicle === netId) return;

  fishingVehicle = netId;

  if (fishingVehicle === null) {
    Peek.removeEntityEntry(vehiclePeekIds);
    vehiclePeekIds = [];
    return;
  }

  vehiclePeekIds = Peek.addEntityEntry(fishingVehicle, {
    options: [
      {
        icon: 'fas fa-fish',
        label: 'Vis Wegsteken',
        action: (_, vehicle) => {
          if (!vehicle) return;
          removeFishEntity();
        },
        canInteract: () => fishEntity !== null,
      },
    ],
  });
};

export const setFishingLocation = (location: typeof fishingLocation) => {
  // stupid vec3 comparing but also checks if both are null!
  if (fishingLocation?.x === location?.x && fishingLocation?.y === location?.y && fishingLocation?.z === location?.z)
    return;

  fishingLocation = location;

  if (fishingLocation === null) {
    if (fishingLocationBlip && DoesBlipExist(fishingLocationBlip)) {
      RemoveBlip(fishingLocationBlip);
    }
    return;
  }

  const radius = currentJobType === 'boat' ? 75 : 20;
  fishingLocationBlip = AddBlipForRadius(fishingLocation.x, fishingLocation.y, fishingLocation.z, radius);
  SetBlipHighDetail(fishingLocationBlip, true);
  SetBlipColour(fishingLocationBlip, 7);
  SetBlipAlpha(fishingLocationBlip, 150);
  Util.setWaypoint(fishingLocation);
};

export const finishJob = () => {
  if (!inReturnZone) return;
  const vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
  if (!vehicle) {
    Notifications.add('Je zit niet in een voertuig');
    return;
  }
  TaskLeaveVehicle(PlayerPedId(), vehicle, 0);
  setTimeout(() => {
    Events.emitNet('jobs:fishing:finish', NetworkGetNetworkIdFromEntity(vehicle));
  }, 1000);
};

export const cleanupFishingJob = () => {
  setFishingVehicle(null);
  setFishingLocation(null);
  setCurrentJobType(null);
  Phone.removeNotification('fishing_amount_tracker');

  if (fishingRodProp !== null) {
    PropAttach.remove(fishingRodProp);
    fishingRodProp = null;
  }
  if (fishEntity !== null) {
    removeFishEntity();
    fishEntity = null;
  }
};

// most braindeath func ever
export const useRod = async () => {
  if (currentJobType === null) return;

  const ped = PlayerPedId();

  if (fishingRodProp !== null) {
    PropAttach.remove(fishingRodProp);
    fishingRodProp = null;
    ClearPedTasksImmediately(ped);
    return;
  }

  if (fishEntity !== null) {
    Notifications.add('Je hebt nog een vis vast', 'error');
    return;
  }

  // if jobtype is car check if we actually aiming at the water
  // Not needed for boat because location is surrounded by water anyway
  // THIS RAYCAST DOES NOT WORK ON OCEANS KEEP IN MIND WHEN YOU WANNA ADD MORE LOCATIONS
  if (currentJobType === 'car') {
    const waterLookingAt = RayCast.doRaycast(50, 128).coords;
    if (!waterLookingAt) {
      Notifications.add('Gooi je vishengel naar het water', 'error');
      return;
    }
    TaskTurnPedToFaceCoord(ped, waterLookingAt.x, waterLookingAt.y, waterLookingAt.z, 1500);
    await Util.Delay(1500);
  }

  fishingRodProp = PropAttach.add('fishing_rod');

  await Util.loadAnimDict('amb@world_human_stand_fishing@idle_a');
  TaskPlayAnim(ped, 'amb@world_human_stand_fishing@idle_a', 'idle_c', 2.0, 2.0, -1.0, 11, 1, false, false, false);

  const timeout = Util.getRndInteger(20, 40);
  await Util.Delay(timeout * 1000);
  RemoveAnimDict('amb@world_human_stand_fishing@idle_a');
  if (fishingRodProp === null) return;

  const success = await Minigames.keygameCustom([
    { speed: 1, size: 7 },
    { speed: 3, size: 10 },
    { speed: 5, size: 15 },
    { speed: 7, size: 18 },
    { speed: 10, size: 21 },
  ]);

  PropAttach.remove(fishingRodProp);
  fishingRodProp = null;
  ClearPedTasksImmediately(ped);

  if (!success) {
    Notifications.add('De vis is ontsnapt!', 'error');
    return;
  }

  const specialLoot = await RPC.execute<boolean>('jobs:fishing:trySpecialLoot');
  if (specialLoot) return;

  await Util.Delay(250);

  const pedCoords = Util.getPlyCoords();
  await Util.loadModel('a_c_fish');
  await Util.loadAnimDict('anim@heists@narcotics@trash');
  fishEntity = CreatePed(4, GetHashKey('a_c_fish'), pedCoords.x, pedCoords.y, pedCoords.z, 0, true, false);
  SetPedComponentVariation(fishEntity, 0, 0, 0, 0);
  SetPedPropIndex(fishEntity, 0, 0, 0, false);
  const bone = GetPedBoneIndex(ped, 24818);
  SetEntityInvincible(fishEntity, true);
  AttachEntityToEntity(fishEntity, ped, bone, -0.5, 0.05, -0.45, 180, 90, 90, true, true, false, true, 2, true);
  SetEntityCompletelyDisableCollision(fishEntity, false, false);
  SetModelAsNoLongerNeeded('a_c_fish');

  fishHoldAnimLoopId = Animations.startAnimLoop({
    animation: {
      dict: 'anim@heists@narcotics@trash',
      name: 'idle',
      flag: 51,
    },
    disableFiring: true,
  });
};

const removeFishEntity = async () => {
  if (!fishEntity || !DoesEntityExist(fishEntity)) return;

  const ped = PlayerPedId();

  if (fishHoldAnimLoopId !== null) {
    Animations.stopAnimLoop(fishHoldAnimLoopId);
    fishHoldAnimLoopId = null;
  }

  // pause to allow proper throwing anim
  Animations.pauseAnimLoopAnimations(true);

  await Util.Delay(100);
  DeleteEntity(fishEntity);
  fishEntity = null;
  TaskPlayAnim(ped, 'anim@heists@narcotics@trash', 'throw_a', 8.0, 8.0, -1, 17, 1, false, false, false);

  await Util.Delay(1000);
  StopAnimTask(ped, 'anim@heists@narcotics@trash', 'throw_a', 1);
  RemoveAnimDict('anim@heists@narcotics@trash');

  Animations.pauseAnimLoopAnimations(false);

  if (fishingVehicle !== null) {
    Events.emitNet('jobs:fishing:putAwayFish', fishingVehicle);
  }
};
