import { Peek, UI, Keys, Notifications, Events, PolyZone, Util, RPC, PropAttach } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { DUMPSTER_MODELS } from './constants.sanitation';
import { isAtBack } from './helpers.sanitation';

let assignedVehicle: number | null = null;
let vehiclePeekIds: string[] = [];
let dumpsterPeekIds: string[] = [];

let targetLocation: Vec3 | null = null;

let returnZoneBuilt = false;
let inReturnZone = false;

let blip = 0;
const removeBlip = () => {
  if (DoesBlipExist(blip)) {
    RemoveBlip(blip);
    blip = 0;
  }
};

let hasTrashbag = false;

export const setAssignedVehicle = (netId: typeof assignedVehicle) => {
  if (assignedVehicle === netId) return;

  assignedVehicle = netId;

  if (assignedVehicle === null) {
    Peek.removeEntityEntry(vehiclePeekIds);
    vehiclePeekIds = [];
    Peek.removeModelEntry(dumpsterPeekIds);
    dumpsterPeekIds = [];
    return;
  }

  vehiclePeekIds = Peek.addEntityEntry(assignedVehicle, {
    options: [
      {
        icon: 'fas fa-sack',
        label: 'Vuiliszak Weggooien',
        action: (_, vehicle) => {
          if (!vehicle) return;
          putBagInVehicle();
        },
        canInteract: vehicle => {
          if (!vehicle) return false;
          if (!hasTrashbag) return false;
          return isAtBack(vehicle);
        },
      },
    ],
    distance: 2.0,
  });
  dumpsterPeekIds = Peek.addModelEntry(DUMPSTER_MODELS, {
    options: [
      {
        icon: 'fas fa-sack',
        label: 'Vuiliszak Nemen',
        action: (_, entity) => {
          if (!entity) return;
          takeBagFromDumpster(entity);
        },
        canInteract: () => !hasTrashbag,
      },
    ],
    distance: 2.0,
  });
};

export const setTargetLocation = (location: typeof targetLocation) => {
  if (
    targetLocation === location ||
    (location !== null && targetLocation !== null && Vector3.isSame(targetLocation, location))
  )
    return;

  targetLocation = location;
  removeBlip();

  if (targetLocation === null) {
    return;
  }

  Notifications.add('De locatie staat op je GPS aangeduid');
  PolyZone.addCircleZone('jobs_sanitation_target', targetLocation, 7, { routingBucket: 0, data: {} });

  blip = AddBlipForCoord(targetLocation.x, targetLocation.y, targetLocation.z);
  SetBlipSprite(blip, 318);
  SetBlipColour(blip, 17);
  SetBlipDisplay(blip, 2);
  SetBlipAsShortRange(blip, false);
  SetBlipScale(blip, 0.9);
  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString('Vuilnis Locatie');
  EndTextCommandSetBlipName(blip);
  SetBlipRoute(blip, true);
  SetBlipRouteColour(blip, 17);
};

export const buildReturnZone = (zone: Vec4) => {
  if (returnZoneBuilt) return;
  const { w: heading, ...center } = zone;
  PolyZone.addBoxZone('jobs_sanitation_return', center, 12, 7, {
    heading,
    minZ: center.z - 2,
    maxZ: center.z + 5,
    data: {},
    routingBucket: 0,
  });
  returnZoneBuilt = true;
};

const destroyReturnZone = () => {
  if (!returnZoneBuilt) return;
  PolyZone.removeZone('jobs_sanitation_return');
  returnZoneBuilt = false;
};

export const setInReturnZone = (isIn: boolean) => {
  if (isIn) {
    inReturnZone = true;
    const vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
    if (vehicle !== 0 && NetworkGetNetworkIdFromEntity(vehicle) === assignedVehicle) {
      UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Wegzetten`);
    }
  } else {
    inReturnZone = false;
    UI.hideInteraction();
  }
};

export const finishJob = () => {
  if (!inReturnZone) return;
  const vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
  if (!vehicle) {
    Notifications.add('Je zit niet in een voertuig');
    return;
  }
  if (NetworkGetNetworkIdFromEntity(vehicle) !== assignedVehicle) {
    Notifications.add('Je zit niet in de gegeven vuilniswagen');
    return;
  }
  TaskLeaveVehicle(PlayerPedId(), vehicle, 0);
  setTimeout(() => {
    Events.emitNet('jobs:sanitation:finish', NetworkGetNetworkIdFromEntity(vehicle));
  }, 1500);
};

export const cleanupSanitationJob = () => {
  setAssignedVehicle(null);
  destroyReturnZone();
  setTargetLocation(null);
  removeBlip();
};

export const addTargetInfo = (total: number) => {
  if (!targetLocation) return;

  PolyZone.removeZone('jobs_sanitation_target');
  Notifications.add(
    `Doorzoek de vuilnisbakken in de buurt en gooi de zakken in de vuilniswagen. Volgens de baas zijn er ${total} vuilbakken met vuil in`,
    'info',
    10000
  );
  removeBlip();
  blip = AddBlipForRadius(targetLocation.x, targetLocation.y, targetLocation.z, 100);
  SetBlipHighDetail(blip, true);
  SetBlipColour(blip, 17);
  SetBlipAlpha(blip, 150);
};

export const takeBagFromDumpster = async (dumpster: number) => {
  if (hasTrashbag) return;

  const dumpsterCoords = Util.getEntityCoords(dumpster);
  const success = await RPC.execute('jobs:sanitation:takeFromDumpster', dumpsterCoords);
  if (!success) {
    Notifications.add('Deze is leeg', 'error');
    return;
  }
  hasTrashbag = true;

  // Animaiton kanker
  await Util.loadAnimDict('missfbi4prepp1');
  const propId = (await PropAttach.add('garbage_bag')) ?? 0;
  const ped = PlayerPedId();
  const thread = setInterval(async () => {
    if (!hasTrashbag) {
      clearInterval(thread);
      ClearPedTasks(ped);
      TaskPlayAnim(ped, 'missfbi4prepp1', '_bag_throw_garbage_man', 8.0, 8.0, -1, 17, 1, false, false, false);
      FreezeEntityPosition(ped, true);
      await Util.Delay(1250);
      PropAttach.remove(propId);
      TaskPlayAnim(ped, 'missfbi4prepp1', 'exit', 8.0, 8.0, 1100, 48, 0.0, false, false, false);
      FreezeEntityPosition(ped, false);
      await Util.Delay(1100);
      ClearPedTasks(ped);

      RemoveAnimDict('missfbi4prepp1');
      return;
    }

    if (IsEntityPlayingAnim(ped, 'missfbi4prepp1', '_bag_walk_garbage_man', 3)) return;
    ClearPedTasksImmediately(ped);
    TaskPlayAnim(ped, 'missfbi4prepp1', '_bag_walk_garbage_man', 6.0, -6.0, -1, 49, 0, false, false, false);
  }, 100);
};

export const putBagInVehicle = () => {
  if (!hasTrashbag) return;
  hasTrashbag = false;
  Events.emitNet('jobs:sanitation:putInVehicle');
};
