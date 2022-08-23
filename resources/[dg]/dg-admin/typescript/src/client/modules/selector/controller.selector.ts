import { Keys, RPC } from '@dgx/client';

import { activateSelector, openSelectorMenu, stopSelector } from './service.selector';

setImmediate(async () => {
  const hasAccess = await RPC.execute('admin:permissions:hasPermission', 'staff');
  if (!hasAccess) return;
  Keys.register('admin-selector', '(zAdmin) Entity Selector');
  Keys.register('admin-selector-menu', '(zAdmin) Open Selector Menu');

  Keys.onPressDown('admin-selector', () => {
    activateSelector();
  });

  Keys.onPressUp('admin-selector', () => {
    stopSelector();
  });

  Keys.onPressDown('admin-selector-menu', () => {
    openSelectorMenu();
  });

  RegisterCommand(
    'admin:reloadActions',
    () => {
      SendNUIMessage({
        action: 'reloadActions',
      });
    },
    false
  );
});
