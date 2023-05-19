import { abortCameraThread } from 'modules/camera/controller.camera';
import { getState, setState } from './state';
import { PropAttach, Util, Weapons } from '@dgx/client';

let animationThread: NodeJS.Timer | null = null;
let phoneProp: number | null = null;

export const setAnimationLoop = (state: 0 | 1 | 2): void => {
  if (state === 1 && !animationThread) {
    animationThread = setInterval(() => {
      const pState = getState('state');
      const inCall = getState('inCall');
      if (pState !== 1 && !inCall) {
        clearInterval(animationThread!);
        animationThread = null;
        return;
      }
      let ped = PlayerPedId();
      if (inCall) {
        doCallAnimation(ped);
      } else if (pState === 1) {
        doOpenAnimation(ped);
      }
      if (!phoneProp) {
        phoneProp = PropAttach.add('phone');
      }
      Weapons.removeWeapon(undefined, true);
    }, 250);
  }
  if (state === 0 && !getState('inCall')) {
    doCloseAnimation(PlayerPedId());
  }
};

export const setCallAnimation = (state: boolean): void => {
  const ped = PlayerPedId();
  if (state) {
    doCallAnimation(ped);
  } else {
    doCallEndAnimation(ped);
  }
};

export const abortAllAnimations = () => {
  const ped = PlayerPedId();
  abortCameraThread();
  doCallEndAnimation(ped);
  doCloseAnimation(ped);
  cleanupAll();
};

const cleanupAll = () => {
  if (animationThread) {
    clearInterval(animationThread);
    animationThread = null;
  }
  if (phoneProp) {
    PropAttach.remove(phoneProp);
    phoneProp = null;
  }
};

const doAnimation = async (ped: number, dict: string, anim: string, speed: number, speedOut = -1, flag = 50) => {
  await Util.loadAnimDict(dict);
  if (!IsEntityPlayingAnim(ped, dict, anim, 3)) {
    TaskPlayAnim(ped, dict, anim, speed, speedOut, -1, flag, 0, false, false, false);
  }
};

const doOpenAnimation = (ped: number) => {
  if (IsPedInAnyVehicle(ped, false)) {
    doOpenAnimationInVehicle(ped);
  } else {
    doOpenAnimationOnFoot(ped);
  }
};

const doOpenAnimationOnFoot = (ped: number) => {
  const dict = 'cellphone@';
  const anim = 'cellphone_text_in';
  doAnimation(ped, dict, anim, 8.0);
};

const doOpenAnimationInVehicle = (ped: number) => {
  const dict = 'cellphone@in_car@ps';
  const anim = 'cellphone_text_in';
  doAnimation(ped, dict, anim, 7.0);
};

const doCallAnimation = (ped: number) => {
  if (IsPedInAnyVehicle(ped, false)) {
    doCallAnimationInVehicle(ped);
  } else {
    doCallAnimationOnFoot(ped);
  }
};

const doCallAnimationOnFoot = (ped: number) => {
  const dict = 'cellphone@';
  const anim = 'cellphone_call_listen_base';
  doAnimation(ped, dict, anim, 3.0, 3.0, 49);
};

const doCallAnimationInVehicle = (ped: number) => {
  const dict = 'cellphone@in_car@ps';
  const anim = 'cellphone_call_listen_base';
  doAnimation(ped, dict, anim, 3.0, 3.0, 49);
};

const doCallEndAnimation = (ped: number) => {
  setState('inCall', false);
  if (IsPedInAnyVehicle(ped, false)) {
    doCallEndAnimationInVehicle(ped);
  } else {
    doCallEndAnimationOnFoot(ped);
  }
};
const doCallEndAnimationInVehicle = async (ped: number) => {
  const dict = 'cellphone@in_car@ps';
  const anim = 'cellphone_call_to_text';
  StopAnimTask(ped, dict, 'cellphone_call_listen_base', 1.0);
  await doAnimation(ped, dict, anim, 1.3, 5.0);
  await Util.Delay(500);
  if (getState('state') !== 1) {
    doCloseAnimationInVehicle(ped);
  }
};

const doCallEndAnimationOnFoot = async (ped: number) => {
  const dict = 'cellphone@';
  const anim = 'cellphone_call_to_text';
  StopAnimTask(ped, dict, anim, 1.0);
  await doAnimation(ped, dict, anim, 2.5, 8.0);
  await Util.Delay(500);
  if (getState('state') !== 1) {
    doCloseAnimationOnFoot(ped);
  }
};

const doCloseAnimation = (ped: number) => {
  if (IsPedInAnyVehicle(ped, false)) {
    doCloseAnimationInVehicle(ped);
  } else {
    doCloseAnimationOnFoot(ped);
  }
};

const doCloseAnimationInVehicle = (ped: number) => {
  const dict = 'cellphone@in_car@ps';
  StopAnimTask(ped, dict, 'cellphone_text_in', 1.0);
  StopAnimTask(ped, dict, 'cellphone_call_to_text', 1.0);
  cleanupAll();
};

const doCloseAnimationOnFoot = async (ped: number) => {
  const dict = 'cellphone@';
  const anim = 'cellphone_text_out';
  StopAnimTask(ped, dict, 'cellphone_text_in', 1.0);
  await Util.Delay(100);
  doAnimation(ped, dict, anim, 7.0);
  await Util.Delay(100);
  StopAnimTask(ped, dict, anim, 1.0);
  cleanupAll();
};
