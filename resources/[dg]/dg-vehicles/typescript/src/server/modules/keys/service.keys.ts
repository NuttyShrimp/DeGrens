import { Events, Inventory, Notifications, RayCast, RPC, Util } from '@dgx/server';
import { getConfigByHash } from 'modules/info/service.info';

import { getVinForNetId, getVinForVeh } from '../../helpers/vehicle';

import { keyManager } from './classes/keymanager';

const vehClassToDifficulty: Record<CarClass, string> = {
  D: 'easy',
  C: 'easy',
  B: 'medium',
  A: 'medium',
  'A+': 'hard',
  S: 'extreme',
  X: 'extreme',
};
// Map of number onto UUID's
const activeLockPicker = new Map<number, string>();
const idToVehicle = new Map<string, number>();

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
export const startVehicleLockpick = async (src: number) => {
  if (activeLockPicker.has(src)) return;

  const ped = GetPlayerPed(String(src));
  const [veh, entType] = await RayCast.getEntityPlayerLookingAt(src);
  if (!veh || entType !== 2) return;

  const vehNetId = NetworkGetNetworkIdFromEntity(veh);
  const closeToDoor = await RPC.execute<boolean>('vehicles:isNearDoor', src, vehNetId, 1.0);
  if (!closeToDoor) return;

  const vehInfo = getConfigByHash(GetEntityModel(veh));
  if (!vehInfo) return;

  const vin = getVinForNetId(vehNetId);
  if (!vin) return;
  if (keyManager.hasKey(vin, src)) return;

  const id = Util.uuidv4();
  activeLockPicker.set(src, id);
  idToVehicle.set(id, veh);
  SetVehicleAlarm(veh, true);

  if (
    GetVehiclePedIsIn(ped, false) !== veh &&
    GetVehicleDoorLockStatus(veh) !== 1 &&
    GetPedInVehicleSeat(veh, -1) === 0
  ) {
    // TODO: Add dispatch call
    Events.emitNet(
      'vehicles:keys:startLockpick',
      src,
      'door',
      id,
      Math.max(4, (vehInfo.price ?? 0) / 200000),
      vehClassToDifficulty?.[vehInfo.class] ?? 'hard'
    );
  } else if (GetVehiclePedIsIn(ped, false) === veh) {
    Events.emitNet(
      'vehicles:keys:startLockpick',
      src,
      'hotwire',
      id,
      Math.max(5, (vehInfo.price ?? 0) / 200000),
      vehClassToDifficulty?.[vehInfo.class] ?? 'hard'
    );
  } else {
    activeLockPicker.delete(src);
    idToVehicle.delete(id);
  }
};

const validateId = async (src: number, id: string) => {
  if (!id) return false;
  if (!activeLockPicker.has(src)) return false;
  if (activeLockPicker.get(src) !== id) return false;
  activeLockPicker.delete(src);
  const veh = idToVehicle.get(id);
  if (!veh) return false;
  SetVehicleAlarm(veh, false);
  const lockpickItem = await Inventory.getFirstItemOfNameOfPlayer(src, 'lockpick');
  if (!lockpickItem) return false;
  // This should decrease the quality of the specific item
  // average of ~7.5 cars per lockpick
  Inventory.setQualityOfItem(lockpickItem.id, old => old - 13);
  return true;
};

export const handleFailedLP = (src: number, id: string) => {
  if (!validateId(src, id)) {
    return;
  }
  Notifications.add(src, 'Het lockpicken van het voertuig is mislukt!', 'error');
};

export const handleSuccessDoorLP = (src: number, id: string) => {
  if (!validateId(src, id)) {
    return;
  }
  const veh = idToVehicle.get(id);
  if (!veh) return;
  SetVehicleDoorsLocked(veh, 1);
  Notifications.add(src, 'Lockpicken van voertuig gelukt!', 'success');
};

export const handleSuccessHotwire = (src: number, id: string) => {
  if (!validateId(src, id)) {
    return;
  }
  const veh = idToVehicle.get(id);
  if (!veh) return;
  const vin = getVinForVeh(veh);
  if (!vin) return;
  keyManager.addKey(vin, src);
};
// endregion
