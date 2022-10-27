import { Events, Keys, Minigames, Util } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';

import { toggleVehicleLock } from './service.keys';

export const lockpickInfo = {
  door: {
    animDict: 'veh@break_in@0h@p_m_one@',
    anim: 'low_force_entry_ds',
  },
  hotwire: {
    animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
    anim: 'machinic_loop_mechandplayer',
  },
};

Events.onNet(
  'vehicles:keys:startLockpick',
  async (type: keyof typeof lockpickInfo, id: string, amount: number, diff: { speed: number; size: number }) => {
    await Util.loadAnimDict(lockpickInfo[type].animDict);
    const ped = PlayerPedId();
    TaskPlayAnim(ped, lockpickInfo[type].animDict, lockpickInfo[type].anim, 3.0, 3.0, -1.0, 17, 0, false, false, false);
    const lockpickResult = await Minigames.keygame(amount, diff.speed, diff.size);
    StopAnimTask(ped, lockpickInfo[type].animDict, lockpickInfo[type].anim, 1.0);
    Events.emitNet('vehicles:keys:finishLockPick', type, id, lockpickResult);
  }
);

Keys.onPressDown('vehicle-lock', () => {
  toggleVehicleLock();
});

Keys.register('vehicle-lock', 'Toggle auto slot', 'L');

on('vehicles:keys:share', () => {
  const veh = getCurrentVehicle();
  if (!veh) return;
  const numSeats = GetVehicleModelNumberOfSeats(GetEntityModel(veh));
  Events.emitNet('vehicles:keys:shareToPassengers', NetworkGetNetworkIdFromEntity(veh), numSeats);
});
