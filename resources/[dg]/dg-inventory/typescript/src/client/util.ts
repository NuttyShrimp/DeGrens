import { Hospital, Police, Util } from '@dgx/client';

export const canOpenInventory = () => {
  const state = LocalPlayer.state;
  return !state.inv_busy && state.isLoggedIn && !IsPauseMenuActive() && !Hospital.isDown() && !Police.isCuffed();
};

export const doLookAnimation = async () => {
  const ped = PlayerPedId();
  const animDict = 'pickup_object';
  const anim = 'putdown_low';
  await Util.loadAnimDict(animDict);
  TaskPlayAnim(ped, animDict, anim, 4.0, 4.0, -1, 50, 0.0, false, false, false);
  await Util.Delay(1000);
  ClearPedSecondaryTask(ped);
};

export const doOpenAnimation = async () => {
  const ped = PlayerPedId();
  const animDict = 'amb@prop_human_bum_bin@idle_b';
  const anim = 'idle_d';
  await Util.loadAnimDict(animDict);
  TaskPlayAnim(ped, animDict, anim, 4.0, 4.0, -1, 50, 0.0, false, false, false);
};

export const doCloseAnimation = async () => {
  const ped = PlayerPedId();
  const animDict = 'amb@prop_human_bum_bin@idle_b';
  const anim = 'exit';
  await Util.loadAnimDict(animDict);
  TaskPlayAnim(ped, animDict, anim, 4.0, 4.0, -1, 50, 0.0, false, false, false);
};

export const doDropAnimation = async () => {
  const ped = PlayerPedId();
  const animDict = 'pickup_object';
  const anim = 'pickup_low';
  await Util.loadAnimDict(animDict);
  TaskPlayAnim(ped, animDict, anim, 8.0, -8.0, -1, 0, 0.0, false, false, false);
  await Util.Delay(1200);
  StopAnimTask(ped, animDict, anim, 1.0);
};
