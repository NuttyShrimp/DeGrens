import { Events, Keys, Minigames, Util } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';

import { toggleVehicleLock } from './service.keys';

let animThread: NodeJS.Timer | null = null;
const lockpickAnimations = {
  door: {
    animDict: 'veh@break_in@0h@p_m_one@',
    play: () => {
      const doAnim = () => {
        TaskPlayAnim(
          PlayerPedId(),
          'veh@break_in@0h@p_m_one@',
          'low_force_entry_ds',
          3.0,
          3.0,
          -1.0,
          17,
          0,
          false,
          false,
          false
        );
      };

      doAnim();
      animThread = setInterval(doAnim, 1000);
    },
    stop: () => {
      if (animThread !== null) {
        clearInterval(animThread);
        animThread = null;
      }
      StopAnimTask(PlayerPedId(), 'veh@break_in@0h@p_m_one@', 'low_force_entry_ds', 1.0);
    },
  },
  hotwire: {
    animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
    play: async () => {
      TaskPlayAnim(
        PlayerPedId(),
        'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
        'machinic_loop_mechandplayer',
        3.0,
        3.0,
        -1.0,
        17,
        0,
        false,
        false,
        false
      );
    },
    stop: () => {
      StopAnimTask(PlayerPedId(), 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@', 'machinic_loop_mechandplayer', 1.0);
    },
  },
};

Events.onNet(
  'vehicles:keys:startLockpick',
  async (type: keyof typeof lockpickAnimations, id: string, amount: number, diff: { speed: number; size: number }) => {
    const animData = lockpickAnimations[type];
    await Util.loadAnimDict(animData.animDict);
    const ped = PlayerPedId();
    animData.play();
    const lockpickResult = await Minigames.keygame(amount, diff.speed, diff.size);
    animData.stop();
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
