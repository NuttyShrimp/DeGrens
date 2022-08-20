import { Events } from '@dgx/client';
import itemDataManager from './classes/itemdatamanager';

Events.onNet('inventory:client:updateAllItemData', (data: Record<string, Inventory.ItemData>) => {
  itemDataManager.itemData = data;
});
