import { Events } from '@dgx/client';
import contextManager from 'classes/contextmanager';

Events.onNet('inventory:client:openContainer', (containerId: string) => {
  contextManager.openInventory({ type: 'container', identifier: containerId });
});
