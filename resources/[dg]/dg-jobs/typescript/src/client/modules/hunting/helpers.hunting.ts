import { Util } from '@dgx/client';
import { PLACING_ANIMATIONS } from './constants.hunting';

export const doBaitPlaceAnim = async () => {
  const ped = PlayerPedId();

  await Util.loadAnimDict(PLACING_ANIMATIONS.start.animDict);
  await Util.loadAnimDict(PLACING_ANIMATIONS.end.animDict);
  const startAnimLength = GetAnimDuration(PLACING_ANIMATIONS.start.animDict, PLACING_ANIMATIONS.start.anim) * 1000;
  const endAnimLength = GetAnimDuration(PLACING_ANIMATIONS.end.animDict, PLACING_ANIMATIONS.end.anim) * 1000;

  TaskPlayAnim(
    ped,
    PLACING_ANIMATIONS.start.animDict,
    PLACING_ANIMATIONS.start.anim,
    1.0,
    8.0,
    startAnimLength,
    0,
    -1,
    false,
    false,
    false
  );
  await Util.Delay(startAnimLength - 100);
  TaskPlayAnim(
    ped,
    PLACING_ANIMATIONS.end.animDict,
    PLACING_ANIMATIONS.end.anim,
    8.0,
    1.0,
    endAnimLength,
    0,
    -1,
    false,
    false,
    false
  );
  await Util.Delay(endAnimLength - 500);
  ClearPedTasks(ped);
};
