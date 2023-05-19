import { Events, UI, Weapons } from '@dgx/client';
import { canOpenPhone, getState, setState } from './state';
import { abortCameraThread } from '../modules/camera/controller.camera';
import { disablePauseMenu } from './controls';
import { abortAllAnimations } from './animations';
import { stopAllSounds } from './sound';
import { cleanInfoEntries } from './info';

export const openPhone = () => {
  if (!canOpenPhone()) return;
  UI.openApplication('phone', undefined, true);
  UI.SetUIFocusCustom(true, true);
  global.exports['dg-lib'].shouldExecuteKeyMaps(false);
  setState('state', 1);
  Weapons.removeWeapon();
};

export const closePhone = (state: 0 | 1 | 2 = 0, skipUI = false) => {
  if (getState('state') === 2) {
    abortCameraThread();
  }
  if (!skipUI) {
    UI.closeApplication('phone');
  }
  disablePauseMenu();
  setState('state', state);
  global.exports['dg-lib'].shouldExecuteKeyMaps(state === 0);
};

export const loadPhone = () => {
  setState('isDisabled', false);
  UI.SendAppEvent('phone', {
    action: 'init',
    data: GetCurrentResourceName(),
  });
  emit('dg-phone:load');
  Events.emitNet('dg-phone:load');
};

export const unloadPhone = () => {
  abortCameraThread();
  closePhone();
  abortAllAnimations();
  stopAllSounds();
  cleanInfoEntries();
};
