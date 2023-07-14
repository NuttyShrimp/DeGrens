import { Core, Events, UI } from '@dgx/client';
import { cleanupPauseCheck } from 'services/controls';
import { closePhone, loadPhone, openPhone, unloadPhone } from 'services/mgmt';
import { restoreStickyNotifs } from 'services/notifications';
import { setState } from 'services/state';

on('onResourceStart', (res: string) => {
  if (res !== GetCurrentResourceName() || !LocalPlayer.state.isLoggedIn) return;
  loadPhone();
});

on('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  unloadPhone();
  cleanupPauseCheck();
});

AddStateBagChangeHandler(
  'isLoggedIn',
  `player:${GetPlayerServerId(PlayerId())}`,
  (bag: string, key: string, value: boolean) => {
    if (value) {
      loadPhone();
    } else {
      unloadPhone();
    }
  }
);

Core.onPlayerUnloaded(() => {
  closePhone();
  setState('isDisabled', true);
});

UI.onLoad(() => {
  loadPhone();
});

UI.onUIReload(() => {
  if (!LocalPlayer.state.isLoggedIn) return;
  unloadPhone();

  setTimeout(() => {
    restoreStickyNotifs();
  }, 2000);
});

Events.onNet('phone:togglePhone', (toggle: boolean) => {
  if (toggle) {
    openPhone();
  } else {
    closePhone();
  }
});
