import { Events, HUD, Sounds, Taskbar, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { getCurrentVehicle } from '@helpers/vehicle';

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
        canCancel: false,
        cancelOnDeath: true,
      });
      if (wasCanceled) return;
    }

    setCurrentSeatbelt('none');
    Sounds.playLocalSound('carunbuckle', 0.8);
    return;
  }

  const uses: number = Entity(veh).state.harnessUses ?? 0;

  if (uses > 0) {
    const [wasCanceled] = await Taskbar.create('person-seat-reclined', 'Putting on harness', 5000, {
      canCancel: false,
      cancelOnDeath: true,
    });
    if (wasCanceled) return;
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

export const tryEjectAfterCrash = (
  oldHealth: number,
  newHealth: number,
  oldSpeed: number,
  newSpeed: number,
  oldVelocity: Vec3
) => {
  if (currentSeatbelt === 'harness') return; // no eject when harnass
  if (oldSpeed < 100) return; // minimum of 100/h
  if (newSpeed > oldSpeed * 0.75) return; // need atleast 25% diff in speed

  const healthDelta = Math.ceil(Math.max(0, oldHealth - newHealth));

  // Calculate chance to eject based on seatbelttype and health diff
  let chance = 0;
  if (currentSeatbelt === 'none') {
    chance = Math.min(100, healthDelta * 2);
  } else if (currentSeatbelt === 'seatbelt') {
    chance = Math.min(50, healthDelta);
  }

  if (Util.getRndInteger(0, 101) <= chance) {
    ejectFromVehicle(oldVelocity);
  }
};

const ejectFromVehicle = (vehicleVelocity: Vec3) => {
  const ped = PlayerPedId();
  const veh = getCurrentVehicle();
  if (!ped || !veh) return;
  const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(veh, 1.0, 0.0, 1.0));
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
