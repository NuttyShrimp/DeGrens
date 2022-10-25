import { Notifications, RayCast, Sounds, Util } from '@dgx/client';

import { hasVehicleKeys } from './cache.keys';

export const toggleVehicleLock = async () => {
  const [veh] = RayCast.getEntityPlayerLookingAt(7.5, 2);
  if (veh === 0 || !IsEntityAVehicle(veh) || !NetworkGetEntityIsNetworked(veh)) return;
  if (!hasVehicleKeys(veh)) return;
  const ped = PlayerPedId();
  await Util.loadAnimDict('anim@mp_player_intmenu@key_fob@');
  TaskPlayAnim(ped, 'anim@mp_player_intmenu@key_fob@', 'fob_click', 3.0, 3.0, -1, 49, 0, false, false, false);
  const vehLockStatus = GetVehicleDoorLockStatus(veh);

  await Util.Delay(750);
  StopAnimTask(ped, 'anim@mp_player_intmenu@key_fob@', 'fob_click', 1.0);
  // Sound are car_lock and car_unlock
  // 1 == unlocked
  if (vehLockStatus === 1) {
    SetVehicleDoorsLocked(veh, 2);
    Sounds.playOnEntity('vehicles_car_key_lock', 'car_lock', 'DLC_NUTTY_SOUNDS', veh);
    if (GetVehicleDoorLockStatus(veh) == 2) {
      Notifications.add('Voertuig op slot gezet');
    } else {
      Notifications.add('Er is iets fout gelopen met het slotensysteem');
    }
  } else {
    SetVehicleDoorsLocked(veh, 1);
    Sounds.playOnEntity('vehicles_car_key_unlock', 'car_unlock', 'DLC_NUTTY_SOUNDS', veh);
    if (GetVehicleDoorLockStatus(veh) == 1) {
      Notifications.add('Voertuig opengedaan');
    } else {
      Notifications.add('Er is iets fout gelopen met het slotensysteem');
    }
  }

  if (!IsPedInAnyVehicle(ped, false)) {
    SetVehicleLights(veh, 2);
    await Util.Delay(250);
    SetVehicleLights(veh, 0);
    await Util.Delay(250);
    SetVehicleLights(veh, 2);
    await Util.Delay(250);
    SetVehicleLights(veh, 0);
  }
};
