import { Events, HUD, Keys, RPC } from '@dgx/client';

import { assignBind, getAllBinds } from '../helpers/binds';
import { isDevModeEnabled, setDevModeEnabled } from '../helpers/devmode';
import { printDebugInfo, toggleNoclip } from '../service/noclip';

setImmediate(() => {
  Events.emitNet('admin:bind:check');
  HUD.addEntry('dev-mode', 'terminal', '#111', () => (isDevModeEnabled() ? 1 : 0), 2, 1, isDevModeEnabled());
});

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;
  toggleNoclip(false);
  HUD.removeEntry('dev-mode');
});

Events.onNet('admin:menu:open', () => {
  SendNUIMessage({
    action: 'openMenu',
  });
  SetNuiFocus(true, true);
});

Events.onNet('admin:toggle:devmode', (toggle: boolean) => {
  setDevModeEnabled(toggle);
});

Events.onNet('admin:bind:check:response', (binds: Record<Binds.bindNames, string | null>) => {
  for (const bind in binds) {
    assignBind(bind as Binds.bindNames, binds[bind as Binds.bindNames]);
  }
});

Events.onNet('admin:noclip:toggle', (toggle: boolean) => {
  toggleNoclip(toggle);
});

Events.onNet('admin:penalty:openModel', (target: string) => {
  SendNUIMessage({
    action: 'openPenaltyModel',
    data: target,
  });
  SetNuiFocus(true, true);
});

Events.onNet('admin:noclip:printInfo', () => {
  printDebugInfo();
});

RPC.register('admin:menu:getBinds', () => {
  return getAllBinds();
});

Events.onNet('admin:menu:forceClose', () => {
  SendNUIMessage({
    action: 'forceCloseMenu',
  });
});

Keys.onPressDown('open-admin', () => {
  Events.emitNet('admin:menu:open');
});

Keys.register('open-admin', '(zAdmin) open menu');
