import { Notifications, RayCast, Sounds, Util } from '@dgx/client';

import { hasVehicleKeys } from './cache.keys';

let classesWithoutLock: number[] = [];

export const toggleVehicleLock = async () => {
  const ped = PlayerPedId();
  let veh: number | undefined;
  if (IsPedInAnyVehicle(PlayerPedId(), false)) {
    veh = GetVehiclePedIsIn(ped, false);
  } else {
    veh = RayCast.doRaycast(7.5, 2)?.entity;
  }
  if (!veh || !IsEntityAVehicle(veh) || !NetworkGetEntityIsNetworked(veh)) return;
  if (!hasVehicleKeys(veh)) return;

  const vehicleClass = GetVehicleClass(veh);
  if (classesWithoutLock.indexOf(vehicleClass) !== -1) {
    Notifications.add('Je kan dit voertuig niet op slot zetten', 'error');
    return;
  }

  await Util.loadAnimDict('anim@mp_player_intmenu@key_fob@');
  TaskPlayAnim(ped, 'anim@mp_player_intmenu@key_fob@', 'fob_click', 3.0, 3.0, -1, 49, 0, false, false, false);
  const vehLockStatus = GetVehicleDoorLockStatus(veh);

  await Util.Delay(750);
  StopAnimTask(ped, 'anim@mp_player_intmenu@key_fob@', 'fob_click', 1.0);
  // Sound are car_lock and car_unlock
  // 1 == unlocked
  if (vehLockStatus === 1) {
    SetVehicleDoorsLocked(veh, 2);
    Sounds.playOnEntity(`vehicles_car_key_lock_${veh}`, 'car_lock', 'DLC_NUTTY_SOUNDS', veh);
    if (GetVehicleDoorLockStatus(veh) == 2) {
      Notifications.add('Voertuig op slot gezet');
    } else {
      Notifications.add('Er is iets fout gelopen met het slotensysteem');
    }
  } else {
    SetVehicleDoorsLocked(veh, 1);
    Sounds.playOnEntity(`vehicles_car_key_unlock_${veh}`, 'car_unlock', 'DLC_NUTTY_SOUNDS', veh);
    if (GetVehicleDoorLockStatus(veh) == 1) {
      Notifications.add('Voertuig opengedaan');
    } else {
      Notifications.add('Er is iets fout gelopen met het slotensysteem');
    }
  }

  SetVehicleLights(veh, 2);
  await Util.Delay(250);
  SetVehicleLights(veh, 0);
  await Util.Delay(250);
  SetVehicleLights(veh, 2);
  await Util.Delay(250);
  SetVehicleLights(veh, 0);
};

export const setClassesWithoutLock = (classes: number[]) => {
  classesWithoutLock = classes;
};
