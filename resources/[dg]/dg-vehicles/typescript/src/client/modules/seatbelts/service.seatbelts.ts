import { Events, HUD, Sounds, Taskbar, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { getCurrentVehicle } from '@helpers/vehicle';

let currentSeatbelt: 'none' | 'seatbelt' | 'harness' = 'none';
let seatbeltThread: NodeJS.Timer | null = null;
let keyThread: NodeJS.Timer | null = null;

let harnessUses = 0;
let ejected = false;

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

    emit('vehicles:seatbelt:toggle', false);
    Sounds.playLocalSound('carunbuckle', 0.8);
    currentSeatbelt = 'none';
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

  emit('vehicles:seatbelt:toggle', true);
  Sounds.playLocalSound('carbuckle', 0.7);
  currentSeatbelt = uses > 0 ? 'harness' : 'seatbelt';

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

export const cleanSeatbeltThread = () => {
  if (seatbeltThread !== null) {
    clearInterval(seatbeltThread);
    seatbeltThread = null;
  }
  currentSeatbelt = 'none';
  harnessUses = 0;
  HUD.toggleEntry('harness-uses', false);
};

export const startSeatbeltThread = (vehicle: number) => {
  if (seatbeltThread !== null) return;
  if (!doesVehicleHaveSeatbelt(vehicle)) return;

  checkHarnessHUD(vehicle);

  let vehicleVelocity = Util.ArrayToVector3(GetEntityVelocity(vehicle));
  let previousSpeed = Util.getVehicleSpeed(vehicle);
  let previousHealth = GetVehicleBodyHealth(vehicle);
  let healthDifference = 0;

  seatbeltThread = setInterval(() => {
    if (currentSeatbelt === 'harness') return;

    healthDifference = Math.ceil(Math.max(0, previousHealth - GetVehicleBodyHealth(vehicle)));

    if (previousSpeed > 100 && healthDifference > 1 && Util.getVehicleSpeed(vehicle) < previousSpeed * 0.75) {
      let chance = 0;
      if (currentSeatbelt === 'none') {
        chance = Math.min(100, healthDifference * 2);
      } else if (currentSeatbelt === 'seatbelt') {
        chance = Math.min(50, healthDifference);
      }

      if (Util.getRndInteger(0, 100) <= chance) {
        ejectFromVehicle(vehicleVelocity);
      }
    }

    vehicleVelocity = Util.ArrayToVector3(GetEntityVelocity(vehicle));
    previousHealth = GetVehicleBodyHealth(vehicle);
    previousSpeed = Util.getVehicleSpeed(vehicle);
  }, 25);
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
  }, 20000);
};

export const getHarnessUses = () => harnessUses;

export const setHarnessUses = (value: number) => {
  harnessUses = value;
};

const checkHarnessHUD = (veh: number) => {
  harnessUses = Entity(veh).state.harnessUses ?? 0;
  if (harnessUses === 0) return;
  HUD.toggleEntry('harness-uses', true);
};

export const justEjected = () => ejected;
