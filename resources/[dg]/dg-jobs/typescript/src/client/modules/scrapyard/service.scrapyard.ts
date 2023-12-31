import { PolyZone, Peek, Notifications, Util, Taskbar, Inventory, Events, RPC, Sync } from '@dgx/client';
import { DOOR_BONES } from './constants.scrapyard';

let inReturnZone = false;
let vehiclePeekIds: string[] = [];
let vehicleNetId: number | null = null;

export const registerScrapyardStartPeekOptions = (partItems: Scrapyard.Config['partItems']) => {
  Peek.addFlagEntry('isScrapyardMfer', {
    options: [
      {
        label: 'Neem opdracht',
        icon: 'fas fa-file',
        action: () => {
          Events.emitNet('jobs:scrapyard:signIn');
        },
        canInteract: () => vehicleNetId === null,
      },
      {
        label: 'Geef onderdeel',
        icon: 'fas fa-box',
        items: partItems,
        partialItems: true,
        action: () => {
          Events.emitNet('jobs:scrapyard:givePart');
        },
      },
    ],
  });
};

export const buildScrapyardReturnZone = (returnZone: Vec4) => {
  const { w: heading, ...coords } = returnZone;
  PolyZone.addBoxZone('scrapyard_return', coords, 15, 30, {
    heading,
    minZ: coords.z - 2,
    maxZ: coords.z + 3,
    data: {},
  });
};

export const setScrapyardVehicleNetId = (netId: typeof vehicleNetId) => {
  if (vehicleNetId === netId) return;

  vehicleNetId = netId;

  if (vehicleNetId === null) {
    Peek.removeEntityEntry(vehiclePeekIds);
    vehiclePeekIds = [];
    return;
  }

  vehiclePeekIds = Peek.addEntityEntry(vehicleNetId, {
    options: [
      {
        label: 'Onderdeel demonteren',
        icon: 'fas fa-wrench',
        action: (_, vehicle) => {
          if (!vehicle) return;
          disassembleVehicle(vehicle);
        },
        canInteract: () => inReturnZone,
      },
    ],
    distance: 2.0,
  });
};

export const setInScrapyardReturnZone = (isIn: boolean) => {
  inReturnZone = isIn;
};

const disassembleVehicle = async (vehicle: number) => {
  const doneParts = await RPC.execute<number[]>('jobs:scrapyard:getDoneParts', NetworkGetNetworkIdFromEntity(vehicle));
  if (!doneParts) return;

  const plyCoords = Util.getPlyCoords();
  const closestDoorId = [...new Array(6)].findIndex((_, i) => {
    if (doneParts.includes(i)) return false;
    if (!GetIsDoorValid(vehicle, i)) return false;
    if (IsVehicleDoorDamaged(vehicle, i)) return false;
    if (GetVehicleDoorAngleRatio(vehicle, i) < 0.1) return false;
    const boneName = DOOR_BONES[i];
    const boneId = GetEntityBoneIndexByName(vehicle, boneName);
    const doorCoords = Util.ArrayToVector3(GetWorldPositionOfEntityBone(vehicle, boneId));
    return plyCoords.distance(doorCoords) < 2;
  });
  if (closestDoorId === -1) {
    Notifications.add('Je staat niet bij een open onderdeel', 'error');
    return;
  }

  if (Inventory.hasObject()) {
    Notifications.add('Je hebt nog iets vast', 'error');
    return;
  }

  Sync.executeAction('setVehicleDoorOpen', vehicle, closestDoorId, true);
  const [canceled] = await Taskbar.create('wrench', 'Demonteren', 10000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 1,
    },
  });
  if (canceled) return;

  Events.emitNet('jobs:scrapyard:getLoot', vehicleNetId, closestDoorId);
};

export const cleanupScrapyard = () => {
  setScrapyardVehicleNetId(null);
};
