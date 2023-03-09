import { Config, Events, Inventory, Notifications, Police, RayCast, RPC, Util } from '@dgx/server';
import { getConfigByEntity } from 'modules/info/service.info';

import { getVinForVeh, setEngineState } from '../../helpers/vehicle';

import { keyManager } from './classes/keymanager';
import { NO_LOCK_CLASSES } from './constants.keys';
import { doesVehicleHaveVin } from 'modules/identification/service.id';

const recentDispatchVehicles = new Set<string>();

const vehClassToDifficulty: Record<CarClass, { speed: number; size: number }> = {
  D: { speed: 2, size: 40 },
  C: { speed: 4, size: 30 },
  B: { speed: 6, size: 20 },
  A: { speed: 8, size: 15 },
  'A+': { speed: 10, size: 10 },
  S: { speed: 14, size: 8 },
  X: { speed: 16, size: 7 },
};

// Map of number onto UUID's
const activeLockPickers = new Map<number, { id: string; vehicle: number; itemId: string }>();

// handle doors of new vehicles
export const handleVehicleLock = async (vehicle: number, vehicleClass?: number) => {
  const driver = GetPedInVehicleSeat(vehicle, -1);
  const hasNPCDriver = driver && !IsPedAPlayer(driver);
  const noDoorlock = vehicleClass !== undefined ? NO_LOCK_CLASSES.door.indexOf(vehicleClass) !== -1 : false;

  if (hasNPCDriver || noDoorlock) {
    SetVehicleDoorsLocked(vehicle, 1);
    return;
  }

  SetVehicleDoorsLocked(vehicle, 2);
};

// region Lockpicking
export const startVehicleLockpick = async (src: number, itemId: string) => {
  if (activeLockPickers.has(src)) return;

  const ped = GetPlayerPed(String(src));
  const vehiclePedIsIn = GetVehiclePedIsIn(ped, false);

  // If ped in vehicle, set target vehicle to that veh
  // Else check the vehicle ped is aiming at
  let targetVehicle: number;
  let lockpickType: 'door' | 'hotwire';
  if (vehiclePedIsIn !== 0) {
    targetVehicle = vehiclePedIsIn;
    lockpickType = 'hotwire';
  } else {
    const { entity } = await RayCast.doRaycast(src);
    if (!entity || GetEntityType(entity) !== 2) return;
    targetVehicle = entity;
    lockpickType = 'door';
  }

  // Check if vehicle class has a lock depending on what we trying to lockpick
  const vehicleClass = await RPC.execute('vehicle:getClass', src, NetworkGetNetworkIdFromEntity(targetVehicle));
  if (vehicleClass == undefined || vehicleClass < 0 || NO_LOCK_CLASSES[lockpickType].indexOf(vehicleClass) !== -1)
    return;

  // check if vehicle already has vin
  const alreadyHasVin = doesVehicleHaveVin(targetVehicle);

  if (lockpickType === 'door') {
    // Check if near door
    const vehNetId = NetworkGetNetworkIdFromEntity(targetVehicle);
    const closeToDoor = await RPC.execute<boolean>('vehicles:isNearDoor', src, vehNetId, 2.0);
    if (!closeToDoor) {
      Notifications.add(src, 'Je staat niet bij een deur', 'error');
      return;
    }

    // when vehicle was unknown and just got vin, we set doorstate to locked.
    // this however has some latency as its an RPC native, so if it was new veh ignore doorlock check
    if (alreadyHasVin) {
      // Check if door is locked
      const vehicleLockStatus = GetVehicleDoorLockStatus(targetVehicle);
      const OPEN_LOCK_STATES = [0, 10];
      if (OPEN_LOCK_STATES.includes(vehicleLockStatus)) {
        Notifications.add(src, 'Voertuig staat niet op slot', 'error');
        return;
      }
    }
  }

  // Check if already has keys
  const vin = getVinForVeh(targetVehicle);
  if (!vin) return;
  if (keyManager.hasKey(vin, src)) {
    Notifications.add(src, 'Ga je je eigen voertuig lockpicken?', 'error');
    return;
  }

  const id = Util.uuidv4();
  activeLockPickers.set(src, { id, vehicle: targetVehicle, itemId });
  SetVehicleAlarm(targetVehicle, true);
  if (lockpickType === 'hotwire') {
    setEngineState(targetVehicle, false, true);
  }

  // Check info to determine difficulty
  const vehInfo = getConfigByEntity(targetVehicle);

  const callChance = Config.getConfigValue('dispatch.callChance.vehiclelockpick');
  const recentlyCalled = recentDispatchVehicles.has(vin);
  if (!recentlyCalled && Util.getRndInteger(0, 101) < callChance) {
    Police.createDispatchCall({
      tag: '10-31',
      title: 'Poging tot voertuig inbraak',
      coords: Util.getEntityCoords(targetVehicle),
      criminal: src,
      vehicle: targetVehicle,
      blip: {
        sprite: 645,
        color: 0,
      },
    });

    recentDispatchVehicles.add(vin);
    setTimeout(() => {
      recentDispatchVehicles.delete(vin);
    }, 3000 * 60);
  }

  const keygameMinAmount = lockpickType === 'door' ? 4 : 5;
  Events.emitNet(
    'vehicles:keys:startLockpick',
    src,
    lockpickType,
    id,
    Math.max(keygameMinAmount, Math.ceil((vehInfo?.price ?? 0) / 200000)),
    vehClassToDifficulty[vehInfo?.class ?? 'D']
  );
  emit('vehicles:lockpick', src, targetVehicle, lockpickType);
};

const validateId = (src: number, id: string) => {
  const active = activeLockPickers.get(src);
  if (!active) return false;
  if (active.id !== id) return false;
  SetVehicleAlarm(active.vehicle, false);
  Inventory.setQualityOfItem(active.itemId, old => old - 5);
  return true;
};

export const handleFail = (src: number, id: string) => {
  if (validateId(src, id)) {
    Notifications.add(src, 'Lockpicken van voertuig mislukt', 'error');
  }
  activeLockPickers.delete(src);
};

export const handleDoorSuccess = (src: number, id: string) => {
  if (validateId(src, id)) {
    const vehicle = activeLockPickers.get(src)!.vehicle;
    SetVehicleDoorsLocked(vehicle, 0);
    Notifications.add(src, 'Lockpicken van voertuig gelukt!', 'success');
  }
  activeLockPickers.delete(src);
};

export const handleHotwireSuccess = (src: number, id: string) => {
  if (validateId(src, id)) {
    const vehicle = activeLockPickers.get(src)!.vehicle;
    const vin = getVinForVeh(vehicle);
    if (!vin) return;
    keyManager.addKey(vin, src);
  }
  activeLockPickers.delete(src);
};
// endregion
