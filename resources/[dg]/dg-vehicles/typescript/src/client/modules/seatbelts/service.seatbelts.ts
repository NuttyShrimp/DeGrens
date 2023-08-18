import { Events, HUD, Sounds, Taskbar, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { getCurrentVehicle, getVehHalfLength } from '@helpers/vehicle';

let currentSeatbelt: 'none' | 'seatbelt' | 'harness' = 'none';
let keyThread: NodeJS.Timer | null = null;

let harnessUses = 0;
let ejected = false;

const setCurrentSeatbelt = (seatbelt: typeof currentSeatbelt) => {
  currentSeatbelt = seatbelt;
  emit('vehicles:seatbelt:toggle', currentSeatbelt !== 'none');
};

export const isSeatbeltOn = () => {
  return currentSeatbelt !== 'none';
};

export const isHarnessOn = () => {
  return currentSeatbelt === 'harness';
};

export const doesVehicleHaveSeatbelt = (veh: number) => {
  const vehClass = GetVehicleClass(veh);
  const illegalClass = [8, 13, 14].includes(vehClass);
  return !illegalClass;
};

export const toggleSeatbelt = async () => {
  const veh = getCurrentVehicle();
  if (!veh) return;
  if (!doesVehicleHaveSeatbelt(veh)) return;

  if (currentSeatbelt !== 'none') {
    if (currentSeatbelt === 'harness') {
      const [wasCanceled] = await Taskbar.create('person-seat-reclined', 'Taking off harness', 5000, {
        canCancel: true,
        cancelOnDeath: true,
      });
      if (wasCanceled) return;
      if (getCurrentVehicle() !== veh) return;
    }

    setCurrentSeatbelt('none');
    Sounds.playLocalSound('carunbuckle', 0.8);
    return;
  }

  const uses: number = Entity(veh).state.harnessUses ?? 0;

  if (uses > 0) {
    const [wasCanceled] = await Taskbar.create('person-seat-reclined', 'Putting on harness', 5000, {
      canCancel: true,
      cancelOnDeath: true,
    });
    if (wasCanceled) return;
    if (getCurrentVehicle() !== veh) return;
    Events.emitNet('vehicles:seatbelts:decreaseHarness', NetworkGetNetworkIdFromEntity(veh));
  }

  Sounds.playLocalSound('carbuckle', 0.7);
  setCurrentSeatbelt(uses > 0 ? 'harness' : 'seatbelt');

  // Disable exiting vehicle while seatbelt on
  if (keyThread !== null) clearInterval(keyThread);
  keyThread = setInterval(() => {
    if (currentSeatbelt === 'none') {
      if (keyThread !== null) {
        clearInterval(keyThread);
        keyThread = null;
      }
      return;
    }
    DisableControlAction(0, 75, true);
    DisableControlAction(27, 75, true);
  }, 1);
};

// Update HUD icon when entering vehicle if harnass installed
export const updateHarnassHUD = (veh: number) => {
  harnessUses = Entity(veh).state.harnessUses ?? 0;
  if (harnessUses === 0) return;
  HUD.toggleEntry('harness-uses', true);
};

export const disableHarnassHUD = () => {
  setCurrentSeatbelt('none');
  harnessUses = 0;
  HUD.toggleEntry('harness-uses', false);
};

export const tryEjectAfterCrash = (oldSpeed: number, newSpeed: number, oldVelocity: Vec3) => {
  if (currentSeatbelt === 'harness') return; // no eject when harnass
  if (newSpeed > oldSpeed * 0.65) return; // need atleast 35% diff in speed

  const maxSafeSpeed = currentSeatbelt === 'none' ? 100 : 180;
  if (oldSpeed < maxSafeSpeed) return;

  ejectFromVehicle(oldVelocity);
};

const ejectFromVehicle = (vehicleVelocity: Vec3) => {
  const ped = PlayerPedId();
  const veh = getCurrentVehicle();
  if (!ped || !veh) return;

  const vehHalfLength = getVehHalfLength(veh);
  const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(veh, 0.0, vehHalfLength - 1, 1.0));
  SetEntityCoords(ped, coords.x, coords.y, coords.z, true, false, false, false);

  setTimeout(() => {
    SetPedToRagdoll(ped, 5511, 5511, 0, false, false, false);
    const velocity = Vector3.create(vehicleVelocity).multiply(3);
    SetEntityVelocity(ped, velocity.x, velocity.y, velocity.z);
  }, 10);

  ejected = true;
  setTimeout(() => {
    ejected = false;
  }, 10000);
};

export const getHarnessUses = () => harnessUses;

export const setHarnessUses = (value: number) => {
  harnessUses = value;
};

export const justEjected = () => ejected;
