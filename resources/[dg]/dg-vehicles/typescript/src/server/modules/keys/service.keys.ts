import { Config, Events, Inventory, Notifications, Police, RayCast, RPC, Sounds, Util } from '@dgx/server';
import { getConfigByEntity } from 'modules/info/service.info';
import { getVinForVeh, setEngineState } from '../../helpers/vehicle';
import { keyManager } from './classes/keymanager';
import { NO_LOCK_CLASSES, CLASS_TO_LOCKPICK_DIFFICULTY } from './constants.keys';

const recentDispatchVehicles = new Set<string>();
const vehicleLockStates = new Map<number, boolean>(); // key: entity, value: locked
const activeLockPickers = new Map<
  number,
  {
    id: string;
    vehicle: number;
    vin: string;
    itemId?: string;
    lockpickType: Vehicles.LockpickType;
  }
>();
const nonLockpickableVins = new Map<string, string>(); // key: vin, value: reject message
const skipDispatchVins = new Set<string>();

// handle doors of new vehicles
export const handleVehicleLockForNewVehicle = async (vehicle: number, vehicleClass?: number) => {
  const driver = GetPedInVehicleSeat(vehicle, -1);
  const hasNPCDriver = driver && !IsPedAPlayer(driver);
  const noDoorlock = vehicleClass !== undefined ? NO_LOCK_CLASSES.door.indexOf(vehicleClass) !== -1 : false;

  if (hasNPCDriver || noDoorlock) {
    setVehicleDoorsLocked(vehicle, false);
    return;
  }

  setVehicleDoorsLocked(vehicle, true);
};

export const getVehicleDoorsLocked = (vehicle: number) => {
  if (!vehicle || !DoesEntityExist(vehicle)) return false;

  const lockedState = vehicleLockStates.get(vehicle);
  const lockedNative = GetVehicleDoorLockStatus(vehicle) === 2;

  // if lockstate isnt cached yet, cache it using native state
  if (lockedState === undefined) {
    vehicleLockStates.set(vehicle, lockedNative);
    return lockedNative;
  }

  // if cached lockstate is not same as native, override native to match cached
  if (lockedNative !== lockedState) {
    SetVehicleDoorsLocked(vehicle, lockedState ? 2 : 1);
  }

  return lockedState;
};

export const setVehicleDoorsLocked = (vehicle: number, locked: boolean) => {
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  vehicleLockStates.set(vehicle, locked);
  SetVehicleDoorsLocked(vehicle, locked ? 2 : 1);
};

// function sets native lock status if statebag value is not being reflected in native status
// the getvehicledoorslocked function actually handles this, so we just call it in a wrapper function with more fitting name for certain usecases
export const validateVehicleLock = (vehicle: number) => {
  getVehicleDoorsLocked(vehicle);
};

// region Lockpicking
export const handleLockpickStart = async (
  plyId: number,
  info: Partial<{
    itemId: string; // itemid of item which will get damaged after lockpick
    overrideLockpickType: Vehicles.LockpickType;
    skipDispatch: boolean; // skip dispatch call on lockpick
    isSlimjim: boolean; // overrides minigame difficulty
  }> = {}
) => {
  if (activeLockPickers.has(plyId)) return;

  const ped = GetPlayerPed(String(plyId));
  let vehicle = GetVehiclePedIsIn(ped, false);
  let lockpickType: Vehicles.LockpickType | undefined = info.overrideLockpickType;

  if (vehicle && DoesEntityExist(vehicle)) {
    const driverSeatPed = GetPedInVehicleSeat(vehicle, -1);
    if (driverSeatPed !== ped) {
      Notifications.add(plyId, 'Je kan dit niet als passagier', 'error');
      return;
    }
    if (lockpickType === 'hack') {
      Notifications.add(plyId, 'Je kan dit niet in een voertuig', 'error');
      return;
    }
    lockpickType ??= 'hotwire';
  } else {
    const { entity } = await RayCast.doRaycast(plyId);
    if (!entity || GetEntityType(entity) !== 2) return;
    vehicle = entity;
    lockpickType ??= 'door';
  }

  if (!lockpickType) return;

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const vin = getVinForVeh(vehicle);
  if (!vin) return;

  // Check if vehicle class has a lock depending on what we trying to lockpick
  const nativeClass = (await RPC.execute<number>('vehicle:getClass', plyId, netId)) ?? -1;
  if (nativeClass < 0 || NO_LOCK_CLASSES[lockpickType].indexOf(nativeClass) !== -1) {
    Notifications.add(plyId, 'Je kan dit niet op dit type voertuig', 'error');
    return;
  }

  if (lockpickType === 'door' || lockpickType === 'hack') {
    // Check if near door
    const nearDoor = await RPC.execute<boolean>('vehicles:isNearDoor', plyId, netId, 2.0);
    if (!nearDoor) {
      Notifications.add(plyId, 'Je staat niet bij een deur', 'error');
      return;
    }

    // only check for door, since hack can sometimes need to be done if door is unlocked to get keys
    if (lockpickType === 'door' && !getVehicleDoorsLocked(vehicle)) {
      Notifications.add(plyId, 'De deur is niet op slot', 'error');
      return;
    }
  }

  const rejectMessage = nonLockpickableVins.get(vin);
  if (rejectMessage) {
    Notifications.add(plyId, rejectMessage, 'error');
    return;
  }

  if (keyManager.hasKey(vin, plyId)) {
    Notifications.add(plyId, 'Ga je je eigen voertuig lockpicken?', 'error');
    return;
  }

  const id = Util.uuidv4();
  activeLockPickers.set(plyId, {
    id,
    vehicle,
    vin,
    itemId: info.itemId,
    lockpickType,
  });

  if (lockpickType === 'hotwire' || lockpickType === 'door') {
    SetVehicleAlarm(vehicle, true);

    if (lockpickType === 'hotwire') {
      setEngineState(vehicle, false, true);
    }
  }

  if (!info.skipDispatch && !recentDispatchVehicles.has(vin) && !skipDispatchVins.has(vin)) {
    const callChance = Config.getConfigValue('dispatch.callChance.vehiclelockpick');
    if (Util.getRndInteger(0, 101) < callChance) {
      Police.createDispatchCall({
        tag: '10-31',
        title: 'Poging tot voertuig inbraak',
        coords: Util.getEntityCoords(vehicle),
        criminal: plyId,
        vehicle,
        blip: {
          sprite: 645,
          color: 0,
        },
      });

      recentDispatchVehicles.add(vin);
      setTimeout(() => {
        recentDispatchVehicles.delete(vin);
      }, 1000 * 60);
    }
  }

  // Check info to determine difficulty
  const vehicleClass = getConfigByEntity(vehicle)?.class ?? 'D';

  let minigameData: any | undefined = undefined;
  if (info.isSlimjim) {
    minigameData = {
      amount: Util.getRndInteger(7, 10),
      speed: 13,
      size: 10,
    };
  } else {
    switch (lockpickType) {
      case 'door':
        minigameData = {
          amount: Util.getRndInteger(4, 7),
          ...CLASS_TO_LOCKPICK_DIFFICULTY[vehicleClass].lockpick,
        };
        break;
      case 'hotwire':
        minigameData = {
          amount: Util.getRndInteger(5, 8),
          ...CLASS_TO_LOCKPICK_DIFFICULTY[vehicleClass].lockpick,
        };
        break;
      case 'hack':
        minigameData = {
          ...CLASS_TO_LOCKPICK_DIFFICULTY[vehicleClass].hack,
        };
        break;
    }
  }

  Events.emitNet('vehicles:keys:startLockpick', plyId, lockpickType, id, minigameData);
  emit('vehicles:lockpick', plyId, vehicle, lockpickType);

  Util.Log(
    'vehicles:lockpick',
    {
      lockpickType,
      vin,
    },
    `${Util.getName(plyId)}(${plyId}) started lockpicking vehicle ${vin} (${lockpickType})`,
    plyId
  );
};

export const handleLockpickFinish = (plyId: number, id: string, success: boolean) => {
  const lockpickInfo = activeLockPickers.get(plyId);
  if (!lockpickInfo || lockpickInfo.id !== id || !DoesEntityExist(lockpickInfo.vehicle)) return;

  activeLockPickers.delete(plyId);
  SetVehicleAlarm(lockpickInfo.vehicle, false);

  if (lockpickInfo.itemId) {
    Inventory.setQualityOfItem(lockpickInfo.itemId, old => old - 5);
  }

  if (!success) {
    Notifications.add(plyId, 'Mislukt...', 'error');
    return;
  }

  switch (lockpickInfo.lockpickType) {
    case 'door':
      setVehicleDoorsLocked(lockpickInfo.vehicle, false);
      Notifications.add(plyId, 'Lockpicken van voertuig gelukt!', 'success');
      break;
    case 'hotwire':
      keyManager.addKey(lockpickInfo.vin, plyId);
      break;
    case 'hack':
      setVehicleDoorsLocked(lockpickInfo.vehicle, false);
      keyManager.addKey(lockpickInfo.vin, plyId);
      Sounds.playSuccessSoundFromCoord(Util.getEntityCoords(lockpickInfo.vehicle), true);
      break;
  }
};
// endregion

export const setVehicleCannotBeLockpicked = (vin: string, cannotBeLockpicked: boolean, rejectMessage?: string) => {
  if (cannotBeLockpicked) {
    nonLockpickableVins.set(vin, rejectMessage ?? 'Je kan dit voertuig niet lockpicken');
  } else {
    nonLockpickableVins.delete(vin);
  }
};

export const skipDispatchOnLockpickForVin = (vin: string, skipDispatch: string) => {
  if (skipDispatch) {
    skipDispatchVins.add(vin);
  } else {
    skipDispatchVins.delete(vin);
  }
};
