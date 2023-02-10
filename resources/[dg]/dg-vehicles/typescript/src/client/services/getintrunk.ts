import { Events, Keys, Notifications, Peek, RPC, Taskbar, UI, Util, Police, Hospital } from '@dgx/client';

import { toggleVehicleDoor } from './doors';
import { isCloseToBoot } from '@helpers/vehicle';

const ANIM_DICT = 'fin_ext_p1-7';
const ANIM = 'cs_devin_dual-7';

let isInTrunk = false;
let forcedIn = false;
let trunkThread: NodeJS.Timer | null = null;
let cam: number | null = null;

Peek.addGlobalEntry(
  'vehicle',
  {
    options: [
      {
        label: 'Ga in Kofferbak',
        icon: 'fas fa-person-walking-arrow-right',
        action: async (_, vehicle) => {
          if (!vehicle) {
            Notifications.add('Geen kofferbak te vinden', 'error');
            return;
          }
          const [canceled] = await Taskbar.create('car', 'In koffer gaan', 5000, {
            canCancel: true,
            cancelOnDeath: true,
            cancelOnMove: true,
            disarm: true,
            disableInventory: true,
            controlDisables: {
              movement: true,
              carMovement: true,
              combat: true,
            },
          });
          if (canceled) return;
          getInTrunk(vehicle);
        },
        canInteract: veh => {
          return veh != undefined && NetworkGetEntityIsNetworked(veh) && canEnterVehicleTrunk(veh);
        },
      },
    ],
    distance: 2.0,
  },
  true
);

Keys.onPressDown('GeneralUse', () => {
  if (!isInTrunk) return;
  if (forcedIn) return;
  const vehicle = GetEntityAttachedTo(PlayerPedId());
  getOutOfTrunk(vehicle);
});
Keys.onPressDown('housingMain', () => {
  if (!isInTrunk) return;
  if (forcedIn) return;
  const vehicle = GetEntityAttachedTo(PlayerPedId());
  toggleVehicleDoor(vehicle, 5);
});

const canEnterVehicleTrunk = (vehicle: number): boolean => {
  const vehClass = GetVehicleClass(vehicle);
  const bannedClasses = [8, 13, 14, 15, 16, 21];
  if (bannedClasses.includes(vehClass)) return false;

  const boneIndex = GetEntityBoneIndexByName(vehicle, 'boot');
  if (boneIndex === -1 || !GetIsDoorValid(vehicle, 5)) return false; // if no bone/trunk exists, cant enter

  // When door is broken, entitybone pos will return pos of broken off part, so we use back of veh
  if (IsVehicleDoorDamaged(vehicle, 5)) {
    return Util.isAtBackOfEntity(vehicle, 2);
  }

  if (GetVehicleDoorAngleRatio(vehicle, 5) === 0) return false;

  const bonePos = Util.ArrayToVector3(GetWorldPositionOfEntityBone(vehicle, boneIndex));
  return Util.getPlyCoords().distance(bonePos) < 2;
};

RPC.register('vehicles:trunk:canEnterVehicle', (netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return false;
  return canEnterVehicleTrunk(vehicle);
});

const getInTrunk = async (vehicle: number, force = false) => {
  if (isInTrunk) return;
  clearTrunkThread();

  if (!canEnterVehicleTrunk(vehicle)) {
    if (!force) {
      Notifications.add('Je kan niet in deze kofferbak', 'error');
    }
    return;
  }

  const baseOffset = { x: -0.1, y: 0.1, z: -0.5 };
  const ped = PlayerPedId();
  await Util.loadAnimDict(ANIM_DICT);
  const boneIndex = GetEntityBoneIndexByName(vehicle, 'boot');
  const bonePos = Util.ArrayToVector3(GetWorldPositionOfEntityBone(vehicle, boneIndex));
  const offset = Util.ArrayToVector3(GetOffsetFromEntityGivenWorldCoords(vehicle, bonePos.x, bonePos.y, bonePos.z)).add(
    baseOffset
  );
  TaskPlayAnim(ped, ANIM_DICT, ANIM, 8.0, 8.0, -1, 1, 999.0, false, false, false);
  AttachEntityToEntity(ped, vehicle, 0, offset.x, offset.y, offset.z, 5, 0, 50, true, false, false, true, 1, true);

  isInTrunk = true;
  forcedIn = force;
  setTrunkCamActive(true);
  if (!force) {
    UI.showInteraction(
      `${Keys.getBindedKey('+GeneralUse')} - Stap Uit | ${Keys.getBindedKey('+housingMain')} - Koffer`
    );
  }
  Events.emitNet('vehicles:trunk:enter', NetworkGetNetworkIdFromEntity(vehicle));

  Police.pauseCuffAnimation(true);
  Hospital.pauseDownAnimation(true);

  trunkThread = setInterval(() => {
    const vehicleAttachedTo = GetEntityAttachedTo(ped);
    if (!DoesEntityExist(vehicleAttachedTo)) {
      getOutOfTrunk();
    }
    setTrunkCamPosition();
  }, 1);
};

// We keep in mind that veh can be undefined to be able to leave trunk when vehicle gets deleted
const getOutOfTrunk = (vehicle?: number, force = false) => {
  if (vehicle) {
    vehicle = DoesEntityExist(vehicle) ? vehicle : undefined;
  }
  if (vehicle && GetVehicleDoorAngleRatio(vehicle, 5) === 0 && !IsVehicleDoorDamaged(vehicle, 5) && !force) {
    Notifications.add('De koffer is dicht...', 'error');
    return;
  }

  clearTrunkThread();

  const ped = PlayerPedId();
  DetachEntity(ped, false, false);
  const coords = vehicle
    ? Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(vehicle, 0, -3.5, 0))
    : Util.getPlyCoords();
  SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, false);
  StopAnimTask(ped, ANIM_DICT, ANIM, 1);

  isInTrunk = false;
  forcedIn = false;
  setTrunkCamActive(false);
  UI.hideInteraction();
  Events.emitNet('vehicles:trunk:leave');

  Police.pauseCuffAnimation(false);
  Hospital.pauseDownAnimation(false);
};

const clearTrunkThread = () => {
  if (trunkThread !== null) {
    clearInterval(trunkThread);
    trunkThread = null;
  }
};

const setTrunkCamActive = (active: boolean) => {
  if (active) {
    RenderScriptCams(false, false, 0, true, false);
    if (cam !== null) {
      DestroyCam(cam, false);
      cam = null;
    }
    cam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
    SetCamActive(cam, true);
    setTrunkCamPosition();
    RenderScriptCams(true, false, 0, true, true);
  } else {
    RenderScriptCams(false, false, 0, true, false);
    if (cam !== null) {
      DestroyCam(cam, false);
      cam = null;
    }
  }
};

const setTrunkCamPosition = () => {
  if (cam === null) return;
  const ped = PlayerPedId();
  const vehicle = GetEntityAttachedTo(ped);
  const position = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(vehicle, 0, -5.5, 2));
  const heading = GetEntityHeading(vehicle);
  SetCamCoord(cam, position.x, position.y, position.z);
  SetCamRot(cam, -2.5, 0, heading, 0);
};

Events.onNet('vehicles:trunk:forceEnter', (netId: number) => {
  if (isInTrunk) return;
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  getInTrunk(vehicle, true);
});

Events.onNet('vehicles:trunk:forceLeave', (netId: number) => {
  if (!isInTrunk) return;
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  getOutOfTrunk(vehicle, true);
});
