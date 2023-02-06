import { Util, RPC, Inventory } from '@dgx/server';
import inventoryManager from 'modules/inventories/manager.inventories';
import itemDataManager from 'classes/itemdatamanager';
import itemManager from 'modules/items/manager.items';
import { awaitConfigLoad, getConfig } from 'services/config';
import repository from 'services/repository';
import { Item } from 'modules/items/classes/item';

const hasObject = async (plyId: number) => {
  const cid = Util.getCID(plyId);
  const invId = Inventory.concatId('player', cid);
  const inventory = await inventoryManager.get(invId);
  return inventory.hasObject();
};

const giveStarterItems = async (plyId: number) => {
  const cid = Util.getCID(plyId);
  const invId = Inventory.concatId('player', cid);

  const createdItemIds: string[] = [];
  for (const itemName of getConfig().starterItems) {
    const metadata = itemManager.buildInitialMetadata(plyId, itemName);
    const newItem = await itemManager.create({ inventory: invId, name: itemName, metadata });
    if (newItem) {
      createdItemIds.push(newItem.state.id);
    }
  }

  Util.Log(
    'inventory:starterItems',
    {
      itemIds: createdItemIds,
    },
    `${Util.getName(plyId)} has received starter items`,
    plyId
  );
};

const clearInventory = async (type: Inventory.Type, identifier: string) => {
  const invId = Inventory.concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  inventory.destroyAllItems();
};

const addItemToInventory = async (
  type: Inventory.Type,
  identifier: string,
  name: string,
  amount: number,
  metadata?: { [key: string]: any }
) => {
  const createdIds: string[] = [];
  const invId = Inventory.concatId(type, identifier);
  // If item gets added to playerinv, get plyId to build metadata and send itembox event
  const plyId = type === 'player' ? DGCore.Functions.getPlyIdForCid(Number(identifier)) : undefined;
  metadata = metadata ?? itemManager.buildInitialMetadata(plyId, name);

  for (let i = 0; i < amount; i++) {
    const createdItem = await itemManager.create({ inventory: invId, name, metadata });
    if (!createdItem) continue;
    createdIds.push(createdItem.state.id);
  }

  if (plyId) {
    const itemData = itemDataManager.get(name);
    emitNet('inventory:addItemBox', plyId, `${amount}x Ontvangen`, itemData.image);
  }

  Util.Log(
    'inventory:inventory:addItems',
    {
      inventoryId: invId,
      itemName: name,
      amount,
      metadata,
      itemIds: createdIds,
    },
    `${amount}x ${name} got added to inventory ${invId}`
  );

  return createdIds;
};

const doesInventoryHaveItems = async (type: Inventory.Type, identifier: string, names: string | string[]) => {
  const invId = Inventory.concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  const items = inventory.getItems();
  names = Array.isArray(names) ? names : [names];
  return names.every(name => items.some(item => item.state.name === name));
};

const removeItemByNameFromInventory = async (
  type: Inventory.Type,
  identifier: string,
  name: string,
  amount?: number
): Promise<boolean> => {
  if (!amount) {
    amount = 1;
  }

  const invId = Inventory.concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);

  const itemsToRemove: Item[] = [];
  for (const item of inventory.getItems()) {
    if (item.state.name !== name) continue;
    itemsToRemove.push(item);
    if (itemsToRemove.length === amount) break;
  }

  if (itemsToRemove.length !== amount) return false;

  for (const item of itemsToRemove) {
    item.destroy();
  }

  if (type === 'player') {
    const image = itemDataManager.get(name).image;
    const plyId = DGCore.Functions.getPlyIdForCid(Number(identifier));
    if (plyId) {
      emitNet('inventory:addItemBox', plyId, `${amount}x Verwijderd`, image);
    }
  }

  return true;
};

const removeItemByIdFromInventory = async (
  type: Inventory.Type,
  identifier: string,
  itemId: string
): Promise<boolean> => {
  const invId = Inventory.concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  if (!inventory.hasItemId(itemId)) return false;
  const item = itemManager.get(itemId);
  if (!item) return false;
  item.destroy(true);
  return true;
};

const getAmountInInventory = async (type: Inventory.Type, identifier: string, name: string): Promise<number> => {
  const invId = Inventory.concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  const items = inventory.getItems();
  const amount = items.reduce<number>((acc, cur) => {
    if (cur.state.name === name) return acc + 1;
    return acc;
  }, 0);
  return amount;
};

const getItemStateById = (id: string): Inventory.ItemState | undefined => {
  return itemManager.get(id)?.state;
};

const moveItemToInventory = async (type: Inventory.Type, identifier: string, itemId: string) => {
  const invId = Inventory.concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  const item = itemManager.get(itemId);
  if (!item) return;
  const itemName = itemDataManager.get(item.state.name).name;
  const position = inventory.getFirstAvailablePosition(itemName, item.state.rotated) ?? { x: 0, y: 0 };
  await itemManager.move(0, itemId, position, item.state.rotated, inventory.id);
};

const getItemsInInventory = async (type: Inventory.Type, identifier: string) => {
  const invId = Inventory.concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  return inventory.getItemStates();
};

const getItemsWithNameInInventory = async (type: Inventory.Type, identifier: string, name: string) => {
  const invId = Inventory.concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  return inventory.getItemStatesForName(name);
};

const getFirstItemOfName = async (type: Inventory.Type, identifier: string, name: string) => {
  const items = await getItemsInInventory(type, identifier);
  return items.find(item => item.name === name);
};

// You can use this to create a stash to be used in script with allowedItems (see houserob sell for example)
const createScriptedStash = async (identifier: string, size: number, allowedItems?: string[]) => {
  await awaitConfigLoad();
  const invId = Inventory.concatId('stash', identifier);
  const inventory = await inventoryManager.get(invId);
  inventory.size = size;
  if (allowedItems) {
    inventory.allowedItems = allowedItems;
  }
};

const moveAllItemsToInventory = async (
  originType: Inventory.Type,
  originIdentifier: string,
  targetType: Inventory.Type,
  targetIdentifier: string
) => {
  const originId = Inventory.concatId(originType, originIdentifier);
  const originInventory = await inventoryManager.get(originId);
  const targetId = Inventory.concatId(targetType, targetIdentifier);
  const targetInventory = await inventoryManager.get(targetId);
  const items = originInventory.getItems();
  for (const item of items) {
    await itemManager.move(0, item.state.id, item.state.position, item.state.rotated, targetInventory.id);
  }
};

const getItemStateFromDatabase = (itemId: string) => {
  return repository.getItemState(itemId);
};

// Exports
global.asyncExports('hasObject', hasObject);
global.exports('giveStarterItems', giveStarterItems);
global.exports('clearInventory', clearInventory);
global.asyncExports('addItemToInventory', addItemToInventory);
global.asyncExports('doesInventoryHaveItems', doesInventoryHaveItems);
global.asyncExports('removeItemByNameFromInventory', removeItemByNameFromInventory);
global.asyncExports('removeItemByIdFromInventory', removeItemByIdFromInventory);
global.asyncExports('getAmountInInventory', getAmountInInventory);
global.exports('getItemStateById', getItemStateById);
global.exports('moveItemToInventory', moveItemToInventory);
global.asyncExports('getItemsInInventory', getItemsInInventory);
global.asyncExports('getItemsWithNameInInventory', getItemsWithNameInInventory);
global.asyncExports('getFirstItemOfName', getFirstItemOfName);
global.exports('createScriptedStash', createScriptedStash);
global.exports('moveAllItemsToInventory', moveAllItemsToInventory);
global.asyncExports('getItemStateFromDatabase', getItemStateFromDatabase);

// Events for client
RPC.register('inventory:server:doesPlayerHaveItems', (plyId, names: string | string[]) => {
  const cid = String(Util.getCID(plyId));
  return doesInventoryHaveItems('player', cid, names);
});
RPC.register('inventory:server:removeItemByNameFromPlayer', (plyId, name: string, amount?: number) => {
  const cid = String(Util.getCID(plyId));
  return removeItemByNameFromInventory('player', cid, name, amount);
});
