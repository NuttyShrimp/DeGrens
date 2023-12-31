import {
  Notifications,
  Peek,
  Util,
  PolyZone,
  UI,
  Keys,
  Events,
  PropAttach,
  Taskbar,
  RPC,
  Phone,
  Sounds,
  Animations,
  BlipManager,
} from '@dgx/client';
import { getPropAttachItem, isAnyBackDoorOpen } from './helpers.postop';

let assignedVehicle: number | null = null;
let vehiclePeekIds: string[] = [];

let returnCoords: Vec3;
let returnZoneBuilt = false;
let returnBlip: number = 0;
let inReturnZone = false;

let targetLocation: PostOP.TargetLocation | null = null;
let atDropoff: number | null = null;

let hasPackage = false;
let packagePropId: number | null = null;
let packageAnimLoopId: number | null = null;

export const registerPostOPStartPeekOptions = (types: PostOP.Config['types']) => {
  const options: PeekParams['options'] = Object.entries(types).map(([type, { peekLabel }]) => ({
    label: peekLabel,
    icon: 'fas fa-truck-fast',
    action: option => {
      Events.emitNet('jobs:postop:signIn', option.data.type);
    },
    data: {
      type,
    },
  }));
  Peek.addFlagEntry('isPostOPSignin', {
    options,
    distance: 2.0,
  });
};

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
        icon: 'fas fa-box-taped',
        label: 'Neem pakje',
        action: (_, vehicle) => {
          if (!vehicle) return;
          addPackage(vehicle);
        },
        canInteract: vehicle => {
          if (!vehicle) return false;
          if (hasPackage) return false;
          return Util.isAtBackOfEntity(vehicle, 3);
        },
      },
      {
        icon: 'fas fa-inbox-in',
        label: 'Pakje wegleggen',
        action: (_, vehicle) => {
          if (!vehicle) return;
          putBackPackageInVehicle(vehicle);
        },
        canInteract: vehicle => {
          if (!vehicle) return false;
          if (!hasPackage) return false;
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
                  callbackURL: 'postop/skip',
                },
              ],
            },
          ] satisfies ContextMenu.Entry[]);
        },
      },
    ],
    distance: 5.0,
  });
};

export const setTargetLocation = (location: typeof targetLocation) => {
  // If current loc is same as new do nothing
  if (targetLocation?.id === location?.id) return;

  targetLocation = location;

  // Clean up previous loc
  PolyZone.removeZone('jobs_postop_dropoff');
  BlipManager.removeCategory('jobs_postop_dropoff');

  // If new is null do nothing
  if (targetLocation === null) return;
  Util.setWaypoint(targetLocation.center);

  // Build doors
  for (const idx in targetLocation.dropoffs) {
    PolyZone.addCircleZone('jobs_postop_dropoff', targetLocation.dropoffs[idx], 1.3, {
      routingBucket: 0, // Zone might get built on playerLoaded evt when we are not in default bucket
      data: {
        id: idx,
      },
    });
    BlipManager.addBlip({
      category: 'jobs_postop_dropoff',
      id: `jobs_postop_dropoff_${idx}`,
      coords: targetLocation.dropoffs[idx],
      sprite: 351,
    });
  }
};

export const buildReturnZone = (zone: Vec4) => {
  if (returnZoneBuilt) return;
  const { w: heading, ...center } = zone;
  returnCoords = center;
  PolyZone.addBoxZone('jobs_postop_return', center, 15, 15, {
    heading,
    minZ: center.z - 3,
    maxZ: center.z + 8,
    data: {},
    routingBucket: 0,
  });
  returnBlip = AddBlipForCoord(center.x, center.y, center.z);
  SetBlipSprite(returnBlip, 616);
  SetBlipColour(returnBlip, 15);
  SetBlipDisplay(returnBlip, 2);
  SetBlipScale(returnBlip, 0.9);
  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString('Voertuig Garage');
  EndTextCommandSetBlipName(returnBlip);
  returnZoneBuilt = true;
};

const destroyReturnZone = () => {
  if (!returnZoneBuilt) return;
  PolyZone.removeZone('jobs_postop_return');
  returnZoneBuilt = false;
  if (DoesBlipExist(returnBlip)) {
    RemoveBlip(returnBlip);
    returnBlip = 0;
  }
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
    Events.emitNet('jobs:postop:finish', NetworkGetNetworkIdFromEntity(vehicle));
  }, 2000);
};

export const cleanupPostOPJob = () => {
  setAssignedVehicle(null);
  destroyReturnZone();
  setTargetLocation(null);
  Phone.removeNotification('postop_amount_tracker');
};

export const setAtDropoff = (dropoff: typeof atDropoff) => {
  atDropoff = dropoff;

  if (atDropoff === null) {
    UI.hideInteraction();
  } else {
    UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Afleveren`);
  }
};

export const tryDropoff = async () => {
  if (atDropoff === null) return;

  if (!hasPackage) {
    Notifications.add('Je hebt geen pakje vast', 'error');
    return;
  }

  // cache dropoff id and reset atDropoff to stop players spamming button
  const dropoffId = atDropoff;
  atDropoff = null;

  const canStart = await RPC.execute('jobs:postop:startDropoff', dropoffId);
  if (!canStart) {
    Notifications.add('Je hebt hier al een pakje afgeleverd', 'error');
    return;
  }

  Sounds.playLocalSound('doorbell', 1);
  const [canceled] = await Taskbar.create('person-carry-box', 'Afleveren', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    controlDisables: {
      combat: true,
      movement: true,
      carMovement: true,
    },
  });

  Events.emitNet('jobs:postop:finishDropoff', dropoffId, !canceled);
  atDropoff = dropoffId;

  if (canceled) return;

  removePackage();
};

const addPackage = async (vehicle: number) => {
  if (hasPackage) return;

  if (!isAnyBackDoorOpen(vehicle)) {
    Notifications.add('De deur is gesloten...', 'error');
    return;
  }

  const [canceled] = await Taskbar.create('box-taped', 'Nemen', 3200, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    controlDisables: {
      combat: true,
      movement: true,
      carMovement: true,
    },
    animation: {
      animDict: 'anim@heists@load_box',
      anim: 'lift_box',
      flags: 0,
    },
  });
  if (canceled) return;

  hasPackage = true;
  packagePropId = PropAttach.add(getPropAttachItem());
  packageAnimLoopId = Animations.startAnimLoop({
    animation: {
      dict: 'anim@heists@box_carry@',
      name: 'idle',
      flag: 51,
    },
    weight: 10,
    disableFiring: true,
  });
};

const putBackPackageInVehicle = (vehicle: number) => {
  if (!hasPackage) return;

  if (!isAnyBackDoorOpen(vehicle)) {
    Notifications.add('De deur is gesloten...', 'error');
    return;
  }

  removePackage();
};

export const setWaypointToReturn = () => {
  Util.setWaypoint(returnCoords);
};

const removePackage = () => {
  hasPackage = false;

  if (packagePropId) {
    PropAttach.remove(packagePropId);
    packagePropId = null;
  }
  if (packageAnimLoopId) {
    Animations.stopAnimLoop(packageAnimLoopId);
    packageAnimLoopId = null;
  }
};
