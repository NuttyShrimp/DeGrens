import { Events, UI } from '@dgx/client';
import contextManager from 'classes/contextmanager';
import itemDataManager from 'classes/itemdatamanager';
import { doDropAnimation } from './../util';

on('dg-ui:reload', () => {
  contextManager.close();
});

on('dg-ui:application-closed', (appName: string) => {
  if (appName !== 'inventory') return;
  contextManager.close();
});

Events.onNet('inventory:client:syncItem', (item: Inventory.ItemState) => {
  UI.SendAppEvent('inventory', { ...item, ...itemDataManager.get(item.name) });
});

Events.onNet('inventory:client:doDropAnimation', () => {
  doDropAnimation();
});

Events.onNet('inventory:client:openOverride', (invId: string) => {
  contextManager.openInventory({
    override: invId,
  });
});