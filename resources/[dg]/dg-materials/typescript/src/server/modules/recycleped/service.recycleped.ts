import { Core, Inventory, Notifications } from '@dgx/server';
import { getConfig } from 'services/config';

let items: Materials.RecyclePed.Items;

export const initializeRecyclePed = async () => {
  items = getConfig().recycleped.allowedItems;
  Inventory.createScriptedStash('materials_recycleped', 10, Object.keys(items));
};

export const addItemToRecycle = (plyIdentifier: string, sellItem: Inventory.ItemState) => {
  const charModule = Core.getModule('characters');
  if (sellItem.quality === undefined || sellItem.quality > getConfig().recycleped.maximumPercentage) {
    const plyId = charModule.getServerIdFromCitizenId(Number(plyIdentifier));
    if (plyId !== undefined) {
      Notifications.add(plyId, 'Dit is nog niet kapot genoeg', 'error');
    }
    Inventory.moveItemToInventory('player', plyIdentifier, sellItem.id);
    return;
  }

  setTimeout(async () => {
    const success = await Inventory.removeItemByIdFromInventory('stash', 'materials_recycleped', sellItem.id);
    if (!success) return;
    const receivedItems = items[sellItem.name];
    receivedItems.forEach(i => {
      Inventory.addItemToInventory('player', plyIdentifier, i, 1);
    });
  }, 2000);
};
