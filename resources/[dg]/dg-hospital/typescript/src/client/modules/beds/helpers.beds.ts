import { Util } from '@dgx/client';

export const setHurtWalk = async () => {
  const ped = PlayerPedId();
  await Util.loadAnimSet('move_m@injured');
  SetPedMovementClipset(ped, 'move_m@injured', 1);
};
