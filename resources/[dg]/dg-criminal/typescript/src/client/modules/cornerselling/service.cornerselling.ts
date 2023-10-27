import { Notifications, Util, Peek, Events } from '@dgx/client';
import { BLACKLISTED_PED_MODELS } from './constants.cornerselling';

let cornersellEnabled = false;
let pedsSoldTo: number[] = [];
let buyerPed: number | null = null;
let peekIds: string[] = [];

// Prevent spamming peek during sell anim
let isSelling = false;

export const isCornersellEnabled = () => cornersellEnabled;

export const setCornersellEnabled = (enabled: boolean) => {
  if (cornersellEnabled === enabled) return;

  if (enabled) {
    cornersellEnabled = true;
    Notifications.add('Gestart met verkopen');
    peekIds = Peek.addGlobalEntry('ped', {
      options: [
        {
          label: 'Verkoop',
          icon: 'fas fa-handshake',
          action: async (_, entity) => {
            if (!entity) return;
            sellToPed(entity);
          },
          canInteract: entity => {
            if (isSelling) return false;
            return entity === buyerPed;
          },
        },
      ],
      distance: 1.4,
    });
  } else {
    cornersellEnabled = false;
    Peek.removeGlobalEntry(peekIds);
  }
};

export const findBuyer = async () => {
  if (!cornersellEnabled || buyerPed !== null) return;

  const targetPed = Util.getClosestNpc(10, pedsSoldTo);
  if (targetPed) {
    pedsSoldTo.push(targetPed);
  }

  if (
    !targetPed ||
    IsPedInAnyVehicle(targetPed, true) ||
    IsPedDeadOrDying(targetPed, true) ||
    BLACKLISTED_PED_MODELS.has(GetEntityModel(targetPed) >>> 0) ||
    IsPedInAnyVehicle(PlayerPedId(), true) ||
    !NetworkGetEntityIsNetworked(targetPed) ||
    IsEntityAMissionEntity(targetPed)
  ) {
    setTimeout(() => {
      findBuyer();
    }, 1000);
    return;
  }

  buyerPed = targetPed;
  await Util.requestEntityControl(targetPed);
  await Util.loadAnimDict('mp_safehouselost@');

  ClearPedTasksImmediately(targetPed);
  const buyerCoords = Util.getEntityCoords(targetPed);
  const buyerHeading = Util.getHeadingToFaceEntity(targetPed);
  await Util.goToCoords({ ...buyerCoords, w: buyerHeading + 180 }, 2000, targetPed);
  TaskStartScenarioInPlace(targetPed, 'WORLD_HUMAN_STAND_IMPATIENT_UPRIGHT', 0, false);

  // Await ped being too far away, ped dead or sold to ped
  await Util.awaitCondition(() => {
    if (buyerPed === null) return true;
    const distance = Util.getPlyCoords().distance(Util.getEntityCoords(targetPed));
    return distance > 20 || IsPedDeadOrDying(targetPed, true);
  }, 60000);

  // buyerped gets set to null when finished selling, if not null it timed out
  if (buyerPed !== null) {
    setTimeout(() => {
      findBuyer();
    }, 10000);
  }

  SetPedKeepTask(targetPed, false);
  ClearPedTasks(targetPed);
  TaskWanderStandard(targetPed, 10, 10);
  SetPedAsNoLongerNeeded(targetPed);

  buyerPed = null;
};

const sellToPed = async (buyer: number) => {
  if (buyer !== buyerPed) return;

  isSelling = true;
  const ped = PlayerPedId();
  ClearPedTasksImmediately(buyer);
  const plyCoords = Util.getPlyCoords();
  const heading = Util.getHeadingToFaceEntity(buyer);

  let pedPositioned = false;
  let buyerPositioned = false;

  Util.goToCoords(
    {
      ...Util.getEntityCoords(buyer),
      w: heading + 180,
    },
    3000,
    buyer
  ).then(() => {
    buyerPositioned = true;
    FreezeEntityPosition(buyer, true);
  });
  Util.goToCoords(
    {
      ...plyCoords,
      w: heading,
    },
    3000
  ).then(() => {
    pedPositioned = true;
  });

  await Util.awaitCondition(() => pedPositioned && buyerPositioned);

  TaskPlayAnim(ped, 'mp_safehouselost@', 'package_dropoff', 8.0, 1.0, -1, 16, 0, false, false, false);
  TaskPlayAnim(buyer, 'mp_safehouselost@', 'package_dropoff', 8.0, 1.0, -1, 16, 0, false, false, false);

  setTimeout(() => {
    FreezeEntityPosition(buyer, false);
    const zone = GetNameOfZone(plyCoords.x, plyCoords.y, plyCoords.z);
    Events.emitNet('criminal:cornersell:sell', zone);
    buyerPed = null;
    isSelling = false;
  }, 5000);
};
