import { XYCoord } from 'react-dnd';
import { nuiAction } from '@src/lib/nui-comms';

import { store, type } from '../../lib/redux';

import { CELLS_PER_ROW } from './constants';

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

export const updateItemPosition = (itemId: string, inventoryId: string, position: XYCoord) => {
  const state = getState();
  const item = state.items[itemId];
  if (!item) return;
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

  Object.values(state.items)
    .filter(i => i.inventory === item.inventory)
    .filter(i => i.id !== itemId)
    .forEach(i => {
      if (i.hotkey !== key) return;
      state.items[i.id].hotkey = undefined;
      nuiAction('inventory/unbindItem', { id: i.id });
    });

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
 * Function which returns array with all items that need to be checked for interference
 * @param itemId Item to not include in array
 * @param inventoryId Inventory to check
 */
const getPossibleOverlappingItems = (itemId: string, inventoryId: string): Inventory.Item[] => {
  const state = getState();
  return Object.values(state.items)
    .filter(i => i.inventory === inventoryId)
    .filter(i => i.id !== itemId);
};

/**
 * Function which finds first available space for item
 * @param itemId Item you want to find free space for
 * @param inventoryId Inventory you want to find free space in
 * @returns XYCoord of found available position or undefined if none was found
 */
export const getFirstFreeSpace = (itemId: string, inventoryId: string): XYCoord | undefined => {
  const state = getState();
  const gridSize = state.inventories[inventoryId].size;
  const itemSize = state.items[itemId].size;

  const itemsThatMayOverlap = getPossibleOverlappingItems(itemId, inventoryId);
  if (itemsThatMayOverlap.length === 0) return { x: 0, y: 0 }; // If there are no overlapping items, we can place item at origin

  for (let y = 0; y < gridSize - itemSize.y + 1; y++) {
    for (let x = 0; x < CELLS_PER_ROW - itemSize.x + 1; x++) {
      if (isAnyItemOverlapping(itemsThatMayOverlap, { x, y }, itemSize)) continue;
      return { x, y };
    }
  }
  return;
};

/**
 * Function which checks if item can be placed at provided position
 * @param itemId Item to check
 * @param inventoryId Inventory to check position in
 * @param newPosition Position to check if free
 */
export const canPlaceItemAtPosition = (itemId: string, inventoryId: string, newPosition: XYCoord): boolean => {
  const state = getState();
  const item = state.items[itemId];

  const outOfBounds =
    newPosition.x < 0 ||
    newPosition.x + item.size.x > CELLS_PER_ROW ||
    newPosition.y < 0 ||
    newPosition.y + item.size.y > state.inventories[inventoryId].size;
  if (outOfBounds) return false;

  const itemsThatMayOverlap = getPossibleOverlappingItems(itemId, inventoryId);
  if (itemsThatMayOverlap.length === 0) return true;

  return !isAnyItemOverlapping(itemsThatMayOverlap, newPosition, item.size);
};

export const isItemAllowedInInventory = (itemName: string, inventoryId: string): boolean => {
  const state = getState();
  if (inventoryId === state.primaryId) return true;
  const allowedItems = (state.inventories[inventoryId] as Inventory.SecondarySide).allowedItems;
  if (!allowedItems) return true;
  return allowedItems.some(name => name === itemName);
};

export const areRequirementsFullfilled = (requirements: Inventory.ItemRequirements | undefined): boolean => {
  if (!requirements) return true;
  const state = getState();
  if (requirements.cash) {
    const playerCash = (state.inventories[state.primaryId] as Inventory.PrimarySide).cash;
    if (playerCash < requirements.cash) return false;
  }
  if (requirements.items) {
    const playerItemNames = Object.values(state.items)
      .filter(i => i.inventory === state.primaryId)
      .map(i => i.name);
    for (const requiredItem of requirements.items) {
      const index = playerItemNames.findIndex(name => name === requiredItem.name);
      if (index === -1) return false;
      playerItemNames.splice(index, 1);
    }
  }
  return true;
};

/**
 * Function which checks if any of provided items overlap imaginary item with given position and size
 * @param items All possible overlapping items
 * @param position Position to check
 * @param size Size to check
 */
const isAnyItemOverlapping = (items: Inventory.Item[], position: XYCoord, size: XYCoord): boolean => {
  return items.some(i => doRectanglesOverlap(position, size, i.position, i.size));
};

const doRectanglesOverlap = (
  movingPosition: XYCoord,
  movingSize: XYCoord,
  otherPosition: XYCoord,
  otherSize: XYCoord
): boolean => {
  return (
    movingPosition.x < otherPosition.x + otherSize.x &&
    movingPosition.x + movingSize.x > otherPosition.x &&
    movingPosition.y < otherPosition.y + otherSize.y &&
    movingPosition.y + movingSize.y > otherPosition.y
  );
};
