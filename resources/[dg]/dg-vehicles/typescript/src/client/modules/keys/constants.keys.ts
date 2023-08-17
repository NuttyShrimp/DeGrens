import { Vehicles, Util, Minigames, Animations } from '@dgx/client';

export const LOCKPICK_TYPE_DATA: Record<
  Vehicles.LockpickType,
  {
    start?: () => Promise<any> | any;
    minigame: (data?: any) => Promise<boolean>;
    end?: (data?: any) => Promise<void> | void;
  }
> = {
  door: {
    start: async () => {
      await Util.loadAnimDict('veh@break_in@0h@p_m_one@');

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
      return setInterval(doAnim, 1000);
    },
    minigame: (data: { amount: number; speed: number; size: number }) => {
      return Minigames.keygame(data.amount, data.speed, data.size);
    },
    end: thread => {
      if (thread) {
        clearInterval(thread);
      }
      StopAnimTask(PlayerPedId(), 'veh@break_in@0h@p_m_one@', 'low_force_entry_ds', 1.0);
    },
  },
  hotwire: {
    start: async () => {
      await Util.loadAnimDict('anim@amb@clubhouse@tutorial@bkr_tut_ig3@');

      TaskPlayAnim(
        PlayerPedId(),
        'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
        'machinic_loop_mechandplayer',
        8.0,
        8.0,
        -1,
        17,
        0,
        false,
        false,
        false
      );
    },
    minigame: (data: { amount: number; speed: number; size: number }) => {
      return Minigames.keygame(data.amount, data.speed, data.size);
    },
    end: () => {
      const ped = PlayerPedId();
      const vehData = Vehicles.getCurrentVehicleInfo(); // this animcancel SOMEHOW tps ped out of veh
      StopAnimTask(ped, 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@', 'machinic_loop_mechandplayer', 1);
      if (vehData) {
        SetPedIntoVehicle(ped, vehData.vehicle, vehData.seat);
      }
    },
  },
  hack: {
    minigame: (data: { gridSize: number; time: number }) => {
      return Animations.doLaptopHackAnimation(() => Minigames.binarysudoku(data.gridSize, data.time));
    },
  },
};
