import { Events, Util, Chat, Notifications, RPC, Inventory } from '@dgx/server';
import inventoryManager from 'modules/inventories/manager.inventories';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';
import itemManager from 'modules/items/manager.items';
import { getConfig } from 'services/config';
import { concatId } from '../util';

const doesPlayerHaveObject = async (plyId: number) => {
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
};

const clearInventory = async (type: Inventory.Type, identifier: string) => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  inventory.destroyAllItems();
  Util.Log(
    'inventory:clearInventory',
    {
      invId,
    },
    `Inventory ${invId} got cleared`
  );
};

const addItemToPlayer = (plyId: number, name: string, amount: number, metadata?: { [key: string]: any }) => {
  const itemData = itemDataManager.get(name);
  if (!itemData) throw new Error(`Item with name ${name} does not exist`);
  const cid = Util.getCID(plyId);
  const inventory = concatId('player', cid);
  if (!metadata) {
    metadata = itemManager.buildInitialMetadata(plyId, name);
  }
  for (let i = 0; i < amount; i++) {
    itemManager.create({ inventory, name, metadata });
  }
  Events.emitNet('inventory:client:addItemBox', plyId, `${amount} Ontvangen`, itemData.image);
  Util.Log(
    'inventory:receivedItem',
    {
      cid,
      name,
      amount,
    },
    `${GetPlayerName(String(plyId))} received ${amount}x ${name} (CID: ${cid})`,
    plyId
  );
};

const doesPlayerHaveItems = async (plyId: number, names: string | string[]) => {
  const cid = Util.getCID(plyId);
  const invId = concatId('player', cid);
  const inventory = await inventoryManager.get(invId);
  const items = inventory.getItems();
  if (Array.isArray(names)) {
    return names.every(name => items.some(state => state.name === name));
  } else {
    return items.some(state => state.name === names);
  }
};

const removeItemFromPlayer = async (plyId: number, name: string): Promise<boolean> => {
  const cid = Util.getCID(plyId);
  const invId = concatId('player', cid);
  const inventory = await inventoryManager.get(invId);
  const itemState = inventory.getItems().find(state => state.name === name);
  if (!itemState) return false;
  itemManager.get(itemState.id)?.destroy();
  const image = itemDataManager.get(itemState.name).image;
  Events.emitNet('inventory:client:addItemBox', plyId, 'Verwijderd', image);
  return true;
};

const getAmountPlayerHas = async (plyId: number, name: string): Promise<number> => {
  const cid = Util.getCID(plyId);
  const invId = concatId('player', cid);
  const inventory = await inventoryManager.get(invId);
  const items = inventory.getItems();
  const amount = items.reduce<number>((acc, cur) => {
    if (cur.name === name) return acc + 1;
    return acc;
  }, 0);
  return amount;
};

const getItemById = (id: string): Inventory.ItemState | undefined => {
  return itemManager.get(id)?.state;
};

const moveItemToInventory = async (itemId: string, type: Inventory.Type, identifier: string) => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  const item = itemManager.get(itemId);
  if (!item) return;
  const itemName = itemDataManager.get(item.state.name).name;
  const position = inventory.getFirstAvailablePosition(itemName) ?? { x: 0, y: 0 };
  itemManager.move(0, itemId, position, inventory.id);
};

const getItemsInInventory = async (type: Inventory.Type, identifier: string) => {
  const invId = concatId(type, identifier);
  const inventory = await inventoryManager.get(invId);
  return inventory.getItems();
};

const getFirstIdOfName = async (type: Inventory.Type, identifier: string, name: string) => {
  const items = await getItemsInInventory(type, identifier);
  return items.find(item => item.name === name);
};

// Exports
global.exports('doesPlayerHaveObject', doesPlayerHaveObject);
global.exports('giveStarterItems', giveStarterItems);
global.exports('clearInventory', clearInventory);
global.exports('addItemToPlayer', addItemToPlayer);
global.exports('doesPlayerHaveItems', doesPlayerHaveItems);
global.exports('removeItemFromPlayer', removeItemFromPlayer);
global.exports('getAmountPlayerHas', getAmountPlayerHas);
global.exports('getItemById', getItemById);
global.exports('moveItemToInventory', moveItemToInventory);
global.exports('getItemsInInventory', getItemsInInventory);
global.exports('getFirstIdOfName', getFirstIdOfName);

// Events
Events.onNet('inventory:server:addItemToPlayer', addItemToPlayer);
RPC.register('inventory:server:doesPlayerHaveItems', doesPlayerHaveItems);
RPC.register('inventory:server:removeItemFromPlayer', removeItemFromPlayer);
