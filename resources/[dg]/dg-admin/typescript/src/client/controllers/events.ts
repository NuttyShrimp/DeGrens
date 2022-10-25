import { Events, HUD, RPC } from '@dgx/client';

import { assignBind, getAllBinds } from '../helpers/binds';
import { isDevModeEnabled, setDevModeEnabled } from '../helpers/devmode';
import { isNoclipEnabled, toggleNoclip } from '../service/noclip';
import { togglePlayerBlips } from '../service/playerBlips';

setImmediate(() => {
  Events.emitNet('admin:bind:check');
  HUD.addEntry('dev-mode', 'terminal', '#111', () => (isDevModeEnabled() ? 1 : 0), 2, 1, isDevModeEnabled());
});

on('onResourceStop', () => {
  if (isNoclipEnabled()) {
    toggleNoclip();
  }
  togglePlayerBlips(false);
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

Events.onNet('admin:noclip:toggle', () => {
  toggleNoclip();
});

Events.onNet('admin:penalty:openModel', (target: string) => {
  SendNUIMessage({
    action: 'openPenaltyModel',
    data: target,
  });
  SetNuiFocus(true, true);
});

RPC.register('admin:menu:getBinds', () => {
  return getAllBinds();
});

Events.onNet('admin:menu:forceClose', () => {
  SendNUIMessage({
    action: 'forceCloseMenu',
  });
});
