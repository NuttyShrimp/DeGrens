import { Peek, UI, Keys, Notifications, Events, PolyZone, Util, RPC, PropAttach, Phone, Animations } from '@dgx/client';
import { DUMPSTER_MODELS } from './constants.sanitation';

let assignedVehicle: number | null = null;
let vehiclePeekIds: string[] = [];

// Id is used to check if new location is same as old one
let targetLocationId: number | null = null;
let targetLocation: Omit<Sanitation.Config['locations'][number], 'amount'> | null = null;

let returnZoneCoords: Vec2;
let returnZoneBuilt = false;
let inReturnZone = false;

let blip = 0;
const removeBlip = () => {
  if (blip && DoesBlipExist(blip)) {
    RemoveBlip(blip);
    blip = 0;
  }
};

let holdingTrashbag = false;
let trashbagAnimLoopId: number | null = null;
let trashbagPropId: number | null = null;

export const isHoldingTrashbag = () => holdingTrashbag;

export const hasTargetLocation = () => targetLocationId !== null;

export const setAssignedVehicle = (netId: typeof assignedVehicle) => {
  if (assignedVehicle === netId) return;

  assignedVehicle = netId;

  if (assignedVehicle === null) {
    Peek.removeEntityEntry(vehiclePeekIds);
    vehiclePeekIds = [];
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
          if (!holdingTrashbag) return false;
          return Util.isAtBackOfEntity(vehicle, 3);
        },
      },
      {
        icon: 'fas fa-forward',
        label: 'Volgende locatie',
        action: (_, vehicle) => {
          if (!vehicle) return;
          UI.openApplication('contextmenu', [
            {
              title: 'Wil je zeker dat je deze naar de volgende locatie wil gaan?',
              submenu: [
                {
                  title: 'Ben je echt zeker?',
                  callbackURL: 'sanitation/skip',
                },
              ],
            },
          ] satisfies ContextMenu.Entry[]);
        },
        canInteract: () => !holdingTrashbag,
      },
    ],
    distance: 5.0,
  });
};

export const setTargetLocation = (locationId: typeof targetLocationId, location: typeof targetLocation) => {
  if (targetLocationId === locationId) return;

  targetLocationId = locationId;
  targetLocation = location;
  removeBlip();

  if (targetLocationId === null || targetLocation === null) return;

  blip = AddBlipForRadius(
    targetLocation.coords.x,
    targetLocation.coords.y,
    targetLocation.coords.z,
    targetLocation.range
  );
  SetBlipHighDetail(blip, true);
  SetBlipColour(blip, 17);
  SetBlipAlpha(blip, 150);
  Util.setWaypoint(targetLocation.coords);
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
  returnZoneCoords = center;
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
  setTargetLocation(null, null);
  removeBlip();
  Phone.removeNotification('sanitation_job_tracker');
};

export const takeBagFromDumpster = async (dumpster: number) => {
  if (holdingTrashbag) return;

  // double check if correct model, if you start peek on the correct model but are still running and end up on diff entity that entity will get passed
  if (!DUMPSTER_MODELS.includes(GetEntityModel(dumpster))) return;

  const dumpsterCoords = Util.getEntityCoords(dumpster);
  const success = await RPC.execute('jobs:sanitation:takeFromDumpster', dumpsterCoords);
  if (!success) {
    Notifications.add('Deze is leeg', 'error');
    return;
  }

  holdingTrashbag = true;
  trashbagAnimLoopId = Animations.startAnimLoop({
    animation: {
      dict: 'missfbi4prepp1',
      name: '_bag_walk_garbage_man',
      flag: 49,
    },
    weight: 10,
    disableFiring: true,
  });
  trashbagPropId = PropAttach.add('garbage_bag');
};

const putBagInVehicle = async () => {
  if (!holdingTrashbag) return;

  holdingTrashbag = false;

  if (trashbagAnimLoopId !== null) {
    Animations.stopAnimLoop(trashbagAnimLoopId);
    trashbagAnimLoopId = null;
  }

  // pause to allow proper anim
  Animations.pauseAnimLoopAnimations(true);

  const ped = PlayerPedId();
  TaskPlayAnim(ped, 'missfbi4prepp1', '_bag_throw_garbage_man', 8.0, 8.0, -1, 17, 1, false, false, false);
  FreezeEntityPosition(ped, true);
  await Util.Delay(1250);

  if (trashbagPropId !== null) {
    PropAttach.remove(trashbagPropId);
    trashbagPropId = null;
  }

  TaskPlayAnim(ped, 'missfbi4prepp1', 'exit', 8.0, 8.0, 1100, 48, 0.0, false, false, false);
  FreezeEntityPosition(ped, false);
  await Util.Delay(1100);
  ClearPedTasks(ped);

  Animations.pauseAnimLoopAnimations(false);

  Events.emitNet('jobs:sanitation:putInVehicle');
};

export const setWaypointToReturnZone = () => {
  Util.setWaypoint(returnZoneCoords);
};
