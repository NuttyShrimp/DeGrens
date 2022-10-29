import { Events, Util, RPC } from '@dgx/server';
import inventoryManager from 'modules/inventories/manager.inventories';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';
import itemManager from 'modules/items/manager.items';
import { getConfig } from 'services/config';
import { concatId } from '../util';

const hasObject = async (plyId: number) => {
  const cid = Util.getCID(plyId);
  const invId = concatId('player', cid);
  const inventory = await inventoryManager.get(invId);
  return inventory.hasObject();
};

const giveStarterItems = (plyId: number) => {
  const cid = Util.getCID(plyId);
  const inventory = concatId('player', cid);
  getConfig().starterItems.forEach(name => {
    const metadata = itemManager.buildInitialMetadata(plyId, name);
    itemManager.create({ inventory, name, metadata });
  });
  Util.Log(
    'inventory:inventory:starterItems',
    {
      cid,
    },
    `${cid} received startitems`
  );
};

const clearInventory = async (type: Inventory.Type, identifier: string) => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  inventory.destroyAllItems();
  Util.Log(
    'inventory:inventory:clear',
    {
      invId,
    },
    `Inventory ${invId} got cleared`
  );
};

const addItemToInventory = (
  type: Inventory.Type,
  identifier: string,
  name: string,
  amount: number,
  metadata?: { [key: string]: any }
) => {
  const invId = concatId(type, identifier);
  // If item gets added to playerinv, get plyId to build metadata and send itembox event
  const plyId =
    type === 'player' ? DGCore.Functions.GetPlayerByCitizenId(Number(identifier))?.PlayerData?.source : undefined;
  metadata = metadata ?? itemManager.buildInitialMetadata(plyId, name);
  for (let i = 0; i < amount; i++) {
    itemManager.create({ inventory: invId, name, metadata });
  }
  if (plyId) {
    const itemData = itemDataManager.get(name);
    Events.emitNet('inventory:client:addItemBox', plyId, `${amount}x Ontvangen`, itemData.image);
  }
  Util.Log(
    'inventory:item:added',
    {
      type,
      identifier,
      invId,
      name,
      amount,
      metadata,
    },
    `${amount}x ${name} got added to inventory ${invId}`
  );
};

const doesInventoryHaveItems = async (type: Inventory.Type, identifier: string, names: string | string[]) => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  const items = inventory.getItems();
  if (Array.isArray(names)) {
    return names.every(name => items.some(state => state.name === name));
  } else {
    return items.some(state => state.name === names);
  }
};

const removeItemFromInventory = async (type: Inventory.Type, identifier: string, name: string): Promise<boolean> => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  const itemState = inventory.getItems().find(state => state.name === name);
  if (!itemState) return false;
  itemManager.get(itemState.id)?.destroy();
  if (type === 'player') {
    const image = itemDataManager.get(itemState.name).image;
    const plyId = DGCore.Functions.GetPlayerByCitizenId(Number(identifier))?.PlayerData?.source;
    Events.emitNet('inventory:client:addItemBox', plyId, 'Verwijderd', image);
  }
  return true;
};

const removeItemByIdFromInventory = async (type: Inventory.Type, identifier: string, id: string): Promise<boolean> => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  const itemState = inventory.getItems().find(i => i.id === id);
  if (!itemState) return false;
  itemManager.get(id)?.destroy();
  if (type === 'player') {
    const image = itemDataManager.get(itemState.name).image;
    const plyId = DGCore.Functions.GetPlayerByCitizenId(Number(identifier))?.PlayerData?.source;
    Events.emitNet('inventory:client:addItemBox', plyId, 'Verwijderd', image);
  }
  return true;
};

const getAmountInInventory = async (type: Inventory.Type, identifier: string, name: string): Promise<number> => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  const items = inventory.getItems();
  const amount = items.reduce<number>((acc, cur) => {
    if (cur.name === name) return acc + 1;
    return acc;
  }, 0);
  return amount;
};

const getItemStateById = (id: string): Inventory.ItemState | undefined => {
  return itemManager.get(id)?.state;
};

const moveItemToInventory = async (type: Inventory.Type, identifier: string, itemId: string) => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  const item = itemManager.get(itemId);
  if (!item) return;
  const itemName = itemDataManager.get(item.state.name).name;
  const position = inventory.getFirstAvailablePosition(itemName) ?? { x: 0, y: 0 };
  await itemManager.move(0, itemId, position, inventory.id);
};

const getItemsInInventory = async (type: Inventory.Type, identifier: string) => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  return inventory.getItems();
};

const getItemsForNameInInventory = async (type: Inventory.Type, identifier: string, name: string) => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  return inventory.getItemsForName(name);
};

const getFirstItemOfName = async (type: Inventory.Type, identifier: string, name: string) => {
  const items = await getItemsInInventory(type, identifier);
  return items.find(item => item.name === name);
};

// You can use this to create a stash to be used in script with allowedItems (see houserob sell for example)
const createScriptedStash = async (identifier: string, size: number, allowedItems?: string[]) => {
  const invId = concatId('stash', identifier);
  const inventory = await inventoryManager.get(invId);
  inventory.size = size;
  if (allowedItems) {
    inventory.allowedItems = allowedItems;
  }
};

// Exports
global.asyncExports('hasObject', hasObject);
global.exports('giveStarterItems', giveStarterItems);
global.asyncExports('clearInventory', clearInventory);
global.exports('addItemToInventory', addItemToInventory);
global.asyncExports('doesInventoryHaveItems', doesInventoryHaveItems);
global.asyncExports('removeItemFromInventory', removeItemFromInventory);
global.asyncExports('removeItemByIdFromInventory', removeItemByIdFromInventory);
global.asyncExports('getAmountInInventory', getAmountInInventory);
global.exports('getItemStateById', getItemStateById);
global.asyncExports('moveItemToInventory', moveItemToInventory);
global.asyncExports('getItemsInInventory', getItemsInInventory);
global.asyncExports('getItemsForNameInInventory', getItemsForNameInInventory);
global.asyncExports('getFirstItemOfName', getFirstItemOfName);
global.exports('createScriptedStash', createScriptedStash);

// Events for client
RPC.register('inventory:server:doesPlayerHaveItems', (plyId, names: string | string[]) => {
  const cid = String(Util.getCID(plyId));
  return doesInventoryHaveItems('player', cid, names);
});
RPC.register('inventory:server:removeItemFromPlayer', (plyId, name: string) => {
  const cid = String(Util.getCID(plyId));
  return removeItemFromInventory('player', cid, name);
});
