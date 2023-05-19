import { Events, Hospital, Police } from '@dgx/client';
import { setAnimationLoop, setCallAnimation } from './animations';
import { closePhone } from './mgmt';
import { checkControlLoop } from './controls';
import { startCameraThread } from 'modules/camera/controller.camera';

const state: State = {
  state: 0,
  inCall: false,
  isMuted: false,
  isDisabled: true,
  hasPhone: false,
  inputFocused: false,
};

export const getState = <T extends keyof State>(key: T): State[T] => {
  return state[key];
};

export const setState = <T extends keyof State>(key: T, value: State[T]): void => {
  if (state[key] === value) return;
  state[key] = value;
  if (key === 'state') {
    setAnimationLoop(state.state);
    checkControlLoop(state.state);
    if (state.state === 2) {
      startCameraThread();
    }
  }
  if (key === 'inCall') {
    setCallAnimation(state.inCall);
  }
  if (key === 'hasPhone' && !value && state.state !== 0) {
    closePhone();
  }
};

export const canOpenPhone = (): boolean => {
  return (
    !state.isDisabled && state.hasPhone && LocalPlayer.state.isLoggedIn && !Hospital.isDown() && !Police.isCuffed()
  );
};

Events.onNet('phone:client:setState', setState);
