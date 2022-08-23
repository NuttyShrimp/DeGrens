import { Events, RPC } from '@dgx/client';

import { assignBind, getAllBinds } from '../helpers/binds';
import { setDevModeEnabled } from '../helpers/devmode';
import { isNoclipEnabled, toggleNoclip } from '../service/noclip';
import { togglePlayerBlips } from '../service/playerBlips';

setImmediate(() => {
  Events.emitNet('admin:bind:check');
});

on('onResourceStop', () => {
  if (isNoclipEnabled()) {
    toggleNoclip();
  }
  togglePlayerBlips(false);
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
