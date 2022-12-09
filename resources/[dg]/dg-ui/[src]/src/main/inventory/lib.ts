import { nuiAction } from '@src/lib/nui-comms';

import { store, type } from '../../lib/redux';

import { CELLS_PER_ROW } from './constants';
import { isAnyItemOverlapping } from './util';

const getState = (): Inventory.State => store.getState()['inventory'];

const setState = (data: any): void => {
  store.dispatch({
    type,
    cb: state => ({
      ...state,
      ['inventory']: {
        ...state['inventory'],
        ...data,
      },
    }),
  });
};

export const updateItemPosition = (itemId: string, inventoryId: string, position: Inventory.XY) => {
  const state = getState();
  const item = state.items[itemId];
  if (!item) return;

  // For shop/crafting we handle this in backend, ui will get updated using the itemsync evt anyway
  if (item.amount !== undefined) {
    nuiAction('inventory/getFromShop', { item: item.name, inventory: item.inventory, position });
    item.amount--;
    setState(state);
    return;
  }

  if (item.hotkey && item.inventory !== inventoryId) {
    state.items[itemId].hotkey = undefined;
    nuiAction('inventory/unbindItem', { id: itemId });
  }

  item.position = position;
  item.inventory = inventoryId;
  setState(state);
  nuiAction('inventory/moveItem', { id: itemId, inventory: inventoryId, position });
};

export const syncItem = (pItem: Inventory.Item) => {
  const state = getState();
  const item = state.items[pItem.id];

  // Check if item to be synced already exists
  if (item) {
    // if the syncing items new position is not in primary or secondary inv, we need to remove it
    // else we update its position
    if (state.primaryId !== pItem.inventory && state.secondaryId !== pItem.inventory) {
      delete state.items[pItem.id];
    } else {
      item.inventory = pItem.inventory;
      item.position = pItem.position;
    }
  } else {
    // if the syncing item is not in primary or secondary inv, we dont need to add it at all
    if (state.primaryId !== pItem.inventory && state.secondaryId !== pItem.inventory) return;
    state.items[pItem.id] = pItem;
  }
  setState(state);
};

/**
 * Funtions which returns whether or not item is currently useable
 */
export const isUseable = (item: Inventory.Item): boolean => {
  return getState().primaryId === item.inventory && (item.useable ?? false);
};

export const unbindItem = (itemId: string) => {
  const state = getState();
  state.items[itemId].hotkey = undefined;
  setState(state);
  nuiAction('inventory/unbindItem', { id: itemId });
};

/**
 * Function which binds object to provided key
 * @returns Returns alert object providable to addNotification
 */
export const bindItemToKey = (itemId: string, key: number): Inventory.Alert => {
  const state = getState();
  const item = state.items[itemId];

  if (!isUseable(item)) return { message: 'Je kan dit item niet binden', type: 'error' };

  // Find item that already has key assigned and unbind
  for (const i of Object.values(state.items)) {
    if (i.hotkey !== key) continue;
    if (i.inventory !== item.inventory) continue;
    if (i.id === item.id) continue;
    state.items[i.id].hotkey = undefined;
    nuiAction('inventory/unbindItem', { id: i.id });
    break;
  }

  state.items[itemId].hotkey = key;
  setState(state);
  nuiAction('inventory/bindItem', { id: itemId, key });
  return { message: `Je hebt dit item gebind aan '${key}'`, type: 'success' };
};

/**
 * Function which returns inventoryId of opposite side of inventory. Ex: you provide Id from primary then id from secondary gets returned
 */
export const getOtherInventoryId = (inventoryId: string): string => {
  const state = getState();
  return state.primaryId === inventoryId ? state.secondaryId : state.primaryId;
};

/**
 * Function which returns array with all items rectangle coordinates that need to be checked for interference
 * @param itemId Item to not include in array
 * @param inventoryId Inventory to check
 */
const getPossibleOverlappingItems = (itemId: string, inventoryId: string) => {
  const state = getState();
  const rectangles: [Inventory.XY, Inventory.XY][] = [];
  for (const item of Object.values(state.items)) {
    if (item.inventory !== inventoryId) continue;
    if (item.id === itemId) continue;
    rectangles.push([item.position, { x: item.position.x + item.size.x, y: item.position.y + item.size.y }]);
  }
  return rectangles;
};

/**
 * Function which finds first available space for item
 * @param itemId Item you want to find free space for
 * @param inventoryId Inventory you want to find free space in
 * @returns Position of found available position or undefined if none was found
 */
export const getFirstFreeSpace = (itemId: string, inventoryId: string): Inventory.XY | undefined => {
  const state = getState();
  const gridSize = state.inventories[inventoryId].size;
  const itemSize = state.items[itemId].size;

  const itemsThatMayOverlap = getPossibleOverlappingItems(itemId, inventoryId);
  if (itemsThatMayOverlap.length === 0) return { x: 0, y: 0 }; // If there are no overlapping items, we can place item at origin

  for (let y = 0; y < gridSize - itemSize.y + 1; y++) {
    for (let x = 0; x < CELLS_PER_ROW - itemSize.x + 1; x++) {
      const rect = [
        { x, y },
        { x: x + itemSize.x, y: y + itemSize.y },
      ] as [Inventory.XY, Inventory.XY];
      if (isAnyItemOverlapping(itemsThatMayOverlap, rect)) continue;
      return { x, y };
    }
  }
};

/**
 * Function which checks if item can be placed at provided position
 * @param itemId Item to check
 * @param inventoryId Inventory to check position in
 * @param newPosition Position to check if free
 */
export const canPlaceItemAtPosition = (itemId: string, inventoryId: string, newPosition: Inventory.XY): boolean => {
  const state = getState();
  const item = state.items[itemId];

  const itemRect: [Inventory.XY, Inventory.XY] = [
    newPosition,
    { x: newPosition.x + item.size.x, y: newPosition.y + item.size.y },
  ];

  const outOfBounds =
    newPosition.x < 0 ||
    newPosition.x + item.size.x > CELLS_PER_ROW ||
    newPosition.y < 0 ||
    newPosition.y + item.size.y > state.inventories[inventoryId].size;
  if (outOfBounds) return false;

  const itemsThatMayOverlap = getPossibleOverlappingItems(itemId, inventoryId);
  if (itemsThatMayOverlap.length === 0) return true;

  return !isAnyItemOverlapping(itemsThatMayOverlap, itemRect);
};

export const isItemAllowedInInventory = (itemName: string, inventoryId: string): boolean => {
  const state = getState();
  if (inventoryId === state.primaryId) return true;
  const allowedItems = (state.inventories[inventoryId] as Inventory.SecondarySide).allowedItems;
  if (!allowedItems) return true;
  return allowedItems.some(name => name === itemName);
};

export const areRequirementsFullfilled = (requirements: Inventory.Shop.Requirements | undefined): boolean => {
  if (!requirements) return true;
  const state = getState();
  if (requirements.cash) {
    const playerCash = (store.getState() as RootState).character.cash;
    if (playerCash < requirements.cash) return false;
  }
  if (requirements.items) {
    let playerItemNames = Object.values(state.items)
      .filter(i => i.inventory === state.primaryId)
      .map(i => i.name);
    for (const requiredItem of requirements.items) {
      const correspondingIndices = playerItemNames
        .reduce<number[]>((indeces, name, i) => {
          if (name === requiredItem.name) indeces.push(i);
          return indeces;
        }, [])
        .slice(0, requiredItem.amount);
      if (correspondingIndices.length < requiredItem.amount) return false;
      playerItemNames = playerItemNames.filter((_, i) => !correspondingIndices.includes(i));
    }
  }
  return true;
};
