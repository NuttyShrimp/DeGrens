import { Events, Notifications, RayCast, Util } from '@dgx/client';

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

  await Util.Delay(750);
  StopAnimTask(ped, 'anim@mp_player_intmenu@key_fob@', 'fob_click', 1.0);

  Events.emitNet('vehicles:keys:toggleLock', NetworkGetNetworkIdFromEntity(veh));

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
