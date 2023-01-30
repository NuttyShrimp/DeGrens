import { useCallback } from 'react';
import { nuiAction } from '@src/lib/nui-comms';
import { useMainStore } from '@src/lib/stores/useMainStore';

import { CELLS_PER_ROW } from '../constants';
import { useInventoryStore } from '../stores/useInventoryStore';
import { isAnyItemOverlapping } from '../util';

export const useInventory = () => {
  const [items, inventories, primaryId, secondaryId, updateItem, deleteItem] = useInventoryStore(s => [
    s.items,
    s.inventories,
    s.primaryId,
    s.secondaryId,
    s.updateItem,
    s.deleteItem,
  ]);
  const playerCash = useMainStore(s => s.character.cash);

  const updateItemPosition = useCallback(
    (itemId: string, inventoryId: string, position: Inventory.XY) => {
      const item = { ...items[itemId] };
      if (!item) return;

      // For shop/crafting we handle this in backend, ui will get updated using the itemsync evt anyway
      if (item.amount !== undefined) {
        nuiAction('inventory/getFromShop', {
          item: item.name,
          inventory: item.inventory,
          position,
          rotated: item.rotated,
        });
        item.amount--;
        item.rotated = false; // keep item at default rotation
        updateItem(item);
        return;
      }

      if (item.hotkey && item.inventory !== inventoryId) {
        item.hotkey = undefined;
        nuiAction('inventory/unbindItem', { id: itemId });
      }

      item.position = position;
      item.inventory = inventoryId;
      updateItem(item);
      nuiAction('inventory/moveItem', { id: itemId, inventory: inventoryId, position, rotated: item.rotated });
    },
    [items]
  );

  const syncItem = useCallback(
    (pItem: Inventory.Item) => {
      const isInVisibleInventory = pItem.inventory === primaryId || pItem.inventory === secondaryId;
      const itemExists = pItem.id in items;

      // If syncing item is in a visible inventory, update it
      // If syncing item is not in a visible inventory but still exists for us, delete it
      if (isInVisibleInventory) {
        updateItem(pItem);
      } else if (itemExists) {
        deleteItem(pItem.id);
      }
    },
    [primaryId, secondaryId, items]
  );

  const isUseable = useCallback(
    (item: Inventory.Item): boolean => {
      return primaryId === item.inventory && (item.useable ?? false);
    },
    [primaryId]
  );

  const unbindItem = useCallback(
    (itemId: string) => {
      const item = { ...items[itemId] };
      item.hotkey = undefined;
      updateItem(item);
      nuiAction('inventory/unbindItem', { id: itemId });
    },
    [items]
  );

  /**
   * Function which binds object to provided key
   * @returns Returns alert object providable to addNotification
   */
  const bindItemToKey = useCallback(
    (itemId: string, key: number): Inventory.Alert => {
      const item = { ...items[itemId] };

      if (!isUseable(item)) return { message: 'Je kan dit item niet binden', type: 'error' };

      // Find item that already has key assigned and unbind
      for (const i of Object.values(items)) {
        if (i.hotkey !== key) continue;
        if (i.inventory !== item.inventory) continue;
        if (i.id === item.id) continue;
        i.hotkey = undefined;
        updateItem(i);

        nuiAction('inventory/unbindItem', { id: i.id });
        break;
      }

      item.hotkey = key;
      updateItem(item);
      nuiAction('inventory/bindItem', { id: itemId, key });
      return { message: `Je hebt dit item gebind aan '${key}'`, type: 'success' };
    },
    [items, isUseable]
  );

  /**
   * Function which returns inventoryId of opposite side of inventory. Ex: you provide Id from primary then id from secondary gets returned
   */
  const getOtherInventoryId = useCallback(
    (inventoryId: string): string => {
      return primaryId === inventoryId ? secondaryId : primaryId;
    },
    [primaryId, secondaryId]
  );

  /**
   * Function which returns array with all items rectangle coordinates that need to be checked for interference
   * @param itemId Item to not include in array
   * @param inventoryId Inventory to check
   */
  const getPossibleOverlappingItems = useCallback(
    (itemId: string, inventoryId: string) => {
      const rectangles: [Inventory.XY, Inventory.XY][] = [];
      for (const item of Object.values(items)) {
        if (item.inventory !== inventoryId) continue;
        if (item.id === itemId) continue;
        rectangles.push([
          item.position,
          {
            x: item.position.x + item.size[item.rotated ? 'y' : 'x'],
            y: item.position.y + item.size[item.rotated ? 'x' : 'y'],
          },
        ]);
      }
      return rectangles;
    },
    [items]
  );

  /**
   * Function which finds first available space for item
   * @param itemId Item you want to find free space for
   * @param inventoryId Inventory you want to find free space in
   * @returns Position of found available position or undefined if none was found
   */
  const getFirstFreeSpace = useCallback(
    (itemId: string, inventoryId: string): Inventory.XY | undefined => {
      const gridSize = inventories[inventoryId].size;
      const item = items[itemId];
      const itemSize = {
        x: item.size[item.rotated ? 'y' : 'x'],
        y: item.size[item.rotated ? 'x' : 'y'],
      };

      const itemsThatMayOverlap = getPossibleOverlappingItems(itemId, inventoryId);

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
    },
    [inventories, items, getPossibleOverlappingItems]
  );

  /**
   * Function which checks if item can be placed at provided position
   * @param itemId Item to check
   * @param inventoryId Inventory to check position in
   * @param newPosition Position to check if free
   */
  const canPlaceItemAtPosition = useCallback(
    (itemId: string, inventoryId: string, newPosition: Inventory.XY): boolean => {
      const item = items[itemId];

      // Keep rotation in mind
      const itemSize: Inventory.XY = {
        x: item.size[item.rotated ? 'y' : 'x'],
        y: item.size[item.rotated ? 'x' : 'y'],
      };

      const outOfBounds =
        newPosition.x < 0 ||
        newPosition.x + itemSize.x > CELLS_PER_ROW ||
        newPosition.y < 0 ||
        newPosition.y + itemSize.y > inventories[inventoryId].size;
      if (outOfBounds) return false;

      const itemsThatMayOverlap = getPossibleOverlappingItems(itemId, inventoryId);
      if (itemsThatMayOverlap.length === 0) return true;

      const itemRect: [Inventory.XY, Inventory.XY] = [
        newPosition,
        {
          x: newPosition.x + itemSize.x,
          y: newPosition.y + itemSize.y,
        },
      ];

      return !isAnyItemOverlapping(itemsThatMayOverlap, itemRect);
    },
    [items, inventories, getPossibleOverlappingItems]
  );

  const isItemAllowedInInventory = useCallback(
    (itemName: string, inventoryId: string): boolean => {
      if (inventoryId === primaryId) return true;
      const allowedItems = (inventories[inventoryId] as Inventory.SecondarySide).allowedItems;
      if (!allowedItems) return true;
      return allowedItems.some(name => name === itemName);
    },
    [primaryId, inventories]
  );

  const areRequirementsFullfilled = useCallback(
    (requirements: Inventory.Shop.Requirements | undefined): boolean => {
      if (!requirements) return true;
      if (requirements.cash) {
        if (playerCash < requirements.cash) return false;
      }
      if (requirements.items) {
        let playerItemNames = Object.values(items)
          .filter(i => i.inventory === primaryId)
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
    },
    [playerCash, items, primaryId]
  );

  const toggleItemRotation = useCallback((itemId: string, override?: boolean) => {
    updateItem(items => {
      const item = items[itemId];
      const rotated = override === undefined ? !item.rotated : override;
      return { ...item, rotated };
    });
  }, []);

  return {
    updateItemPosition,
    syncItem,
    isUseable,
    unbindItem,
    bindItemToKey,
    getOtherInventoryId,
    areRequirementsFullfilled,
    canPlaceItemAtPosition,
    isItemAllowedInInventory,
    getFirstFreeSpace,
    toggleItemRotation,
  };
};
