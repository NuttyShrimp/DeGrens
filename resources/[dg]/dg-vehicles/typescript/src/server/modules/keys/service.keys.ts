import { Config, Events, Inventory, Notifications, Police, RayCast, RPC, Util } from '@dgx/server';
import { getConfigByHash } from 'modules/info/service.info';

import { getVinForVeh } from '../../helpers/vehicle';

import { keyManager } from './classes/keymanager';

const vehClassToDifficulty: Record<CarClass, { speed: number; size: number }> = {
  D: { speed: 0.5, size: 40 },
  C: { speed: 2, size: 30 },
  B: { speed: 4, size: 20 },
  A: { speed: 6, size: 15 },
  'A+': { speed: 7, size: 10 },
  S: { speed: 8, size: 8 },
  X: { speed: 10, size: 5 },
};

// Map of number onto UUID's
const activeLockPickers = new Map<number, { id: string; vehicle: number; itemId: string }>();

export const handleVehicleLock = async (plyId: number, vehicleNetId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(vehicleNetId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  const driver = GetPedInVehicleSeat(vehicle, -1);
  if (driver && !IsPedAPlayer(driver)) {
    const isDriverDead = await Util.isEntityDead(driver, plyId);
    if (isDriverDead) {
      SetVehicleDoorsLocked(vehicle, 1);
      Util.sendEventToEntityOwner(vehicle, 'vehicles:setEngineState', vehicleNetId, false, true);
    } else {
      SetVehicleDoorsLocked(vehicle, 2);
    }
  }
  if (GetVehicleDoorLockStatus(vehicle) > 2) {
    SetVehicleDoorsLocked(vehicle, 2);
  }
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

    // Check if near door
    const vehNetId = NetworkGetNetworkIdFromEntity(targetVehicle);
    const closeToDoor = await RPC.execute<boolean>('vehicles:isNearDoor', src, vehNetId, 2.0);
    if (!closeToDoor) {
      Notifications.add(src, 'Je staat niet bij een deur', 'error');
      return;
    }

    // Check if door is locked
    const vehicleLockStatus = GetVehicleDoorLockStatus(targetVehicle);
    const OPEN_LOCK_STATES = [0, 10];
    if (OPEN_LOCK_STATES.includes(vehicleLockStatus)) {
      Notifications.add(src, 'Voertuig staat niet op slot', 'error');
      return;
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

  // Check info to determine difficulty
  // Do not return if not found else we cant lockpick shit like a bus or towtruck etcetc
  const vehInfo = getConfigByHash(GetEntityModel(targetVehicle));
  if (!vehInfo) {
    Util.Log(
      'vehicles:missingConfig',
      {
        model: GetEntityModel(targetVehicle),
      },
      `Found a missing model`,
      undefined,
      true
    );
  }

  if (Util.getRndInteger(0, 101) < Config.getConfigValue('dispatch.callChance.vehiclelockpick')) {
    Police.createDispatchCall({
      tag: '10-31',
      title: 'Poging to voertuig inbraak',
      coords: Util.getEntityCoords(targetVehicle),
      criminal: src,
      vehicle: targetVehicle,
      blip: {
        sprite: 645,
        color: 0,
      },
    });
  }
  let keygameMinAmount = lockpickType === 'door' ? 4 : 5;
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
  Inventory.setQualityOfItem(active.itemId, old => old - 10);
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
