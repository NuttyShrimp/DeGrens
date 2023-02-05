import { Events, UI } from '@dgx/client';
import contextManager from 'classes/contextmanager';
import itemDataManager from 'classes/itemdatamanager';
import { doDropAnimation } from './../util';

UI.onUIReload(() => {
  contextManager.close();
});

UI.onApplicationClose(() => {
  contextManager.close();
}, 'inventory');

Events.onNet('inventory:client:syncItem', (item: Inventory.ItemState) => {
  UI.SendAppEvent('inventory', { ...item, ...itemDataManager.get(item.name) });
});

onNet('inventory:doDropAnimation', () => {
  doDropAnimation();
});

Events.onNet('inventory:client:openOverride', (invId: string) => {
  contextManager.openInventory({
    override: invId,
  });
});

Events.onNet('inventory:itemdata:seed', (itemData: Record<string, Inventory.ItemData>) => {
  itemDataManager.seed(itemData);
});
