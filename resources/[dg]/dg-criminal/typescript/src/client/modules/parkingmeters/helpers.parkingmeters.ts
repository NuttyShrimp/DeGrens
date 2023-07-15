import { Util } from '@dgx/client';

const ANIM_DICT = 'veh@break_in@0h@p_m_one@';

export const startParkingMeterAnimation = async () => {
  await Util.loadAnimDict(ANIM_DICT);

  const ped = PlayerPedId();
  const playAnim = () => {
    TaskPlayAnim(ped, ANIM_DICT, 'low_force_entry_ds', 3.0, 3.0, -1.0, 17, 0, false, false, false);
  };

  playAnim();
  const interval = setInterval(playAnim, 1000);

  return () => {
    clearInterval(interval);
    ClearPedTasks(ped);
  };
};
