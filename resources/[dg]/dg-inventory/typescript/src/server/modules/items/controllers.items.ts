import { Events, Util, Financials } from '@dgx/server';
import contextManager from 'classes/contextmanager';
import inventoryManager from 'modules/inventories/manager.inventories';
import shopManager from 'modules/shops/shopmanager';
import { concatId, splitId } from '../../util';
import itemManager from './manager.items';

// Event to get item from shop inv (shop or bench), handles cash or required items removal
Events.onNet('inventory:server:getFromShop', async (src: number, name: string, inventoryId: string, position: Vec2) => {
  const shopInventory = splitId(inventoryId);

  let shopItem: Shops.Item | null = null;
  if (shopInventory.type === 'shop') {
    const item = shopManager.getItems(shopInventory.identifier).find(i => i.name === name);
    if (!item) {
      Util.Log(
        'inventory:shop:notShopItem',
        { name, inventoryId },
        `${Util.getName(src)} tried to get item from shop but item was not in shop`,
        src
      );
      return;
    }
    shopItem = item;
  } else if (shopInventory.type === 'bench') {
    const item = global.exports['dg-materials'].getItemRecipe(src, shopInventory.identifier, name);
    if (!item) {
      Util.Log(
        'inventory:bench:notBenchItem',
        { name, inventoryId },
        `${Util.getName(src)} tried to get item from bench but item was not in bench or not enough rep`,
        src
      );
      return;
    }
    shopItem = item;
  }

  if (shopItem === null) return;

  const openIds = contextManager.getIdsByPlayer(src);
  if (!openIds || !openIds.includes(inventoryId)) {
    Util.Log(
      'inventory:shop:notOpen',
      { name, inventoryId },
      `${Util.getName(src)} tried to get item from shop but did not have shop open`,
      src
    );
    return;
  }

  // Check amount if shop
  if (shopInventory.type === 'shop' && shopItem.amount <= 0) return;

  const cid = Util.getCID(src);
  const invId = concatId('player', cid);

  // Check requirements
  if (shopItem.requirements.cash) {
    const playerCash = Financials.getCash(src);
    if (playerCash < shopItem.requirements.cash) {
      throw new Error(`Player tried to get item for ${shopItem.requirements.cash} but only had ${playerCash}`);
    }
    Financials.removeCash(src, shopItem.requirements.cash, 'shop-item-bought');
  }

  if (shopItem.requirements.items) {
    const plyInventory = await inventoryManager.get(invId);
    const plyItems = plyInventory.getItems();
    const idsToRemove: Set<string> = new Set();
    for (const reqItem of shopItem.requirements.items) {
      for (let i = 0; i < reqItem.amount; i++) {
        const plyItem = plyItems.find(item => item.name === reqItem.name && !idsToRemove.has(item.id));
        if (!plyItem) throw new Error(`Player tried to get item but was missing required item ${reqItem.name}`);
        idsToRemove.add(plyItem.id);
      }
    }
    idsToRemove.forEach(id => itemManager.get(id)?.destroy());
  }

  const metadata = itemManager.buildInitialMetadata(src, name);
  const newItem = await itemManager.create({ inventory: invId, name, metadata, position });
  if (shopInventory.type === 'shop') {
    shopManager.decreaseItem(shopInventory.identifier, name);
  }
  if (!newItem) return;

  if (shopInventory.type === 'shop') {
    Util.Log(
      'inventory:item:bought',
      {
        name,
        inventoryId,
        newItem: newItem.state.id,
      },
      `${Util.getName(src)} bought shopitem ${name} in shop ${inventoryId}`,
      src
    );
  } else if (shopInventory.type === 'bench') {
    emit('inventory:craftedInBench', src, shopInventory.identifier, newItem.state);
  }
});
