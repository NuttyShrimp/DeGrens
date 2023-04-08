import { useCallback } from 'react';
import { closeApplication } from '@src/components/appwrapper';
import { nuiAction } from '@src/lib/nui-comms';
import { useMainStore } from '@src/lib/stores/useMainStore';
import { useNotifications } from '@src/main/notifications/hooks/useNotification';

import config from '../_config';
import { CELLS_PER_ROW } from '../constants';
import { useInventoryStore } from '../stores/useInventoryStore';
import { areSpacesNotOccupied, buildOccupiedGridSpaces } from '../util';

export const useInventory = () => {
  const [items, inventories, primaryId, secondaryId, updateItem, deleteItem, selectedItems, updateInventoryStore] =
    useInventoryStore(s => [
      s.items,
      s.inventories,
      s.primaryId,
      s.secondaryId,
      s.updateItem,
      s.deleteItem,
      s.selectedItems,
      s.updateStore,
    ]);
  const playerCash = useMainStore(s => s.character.cash);
  const { addNotification } = useNotifications();

  const updateItemPosition = useCallback(
    (itemId: string, inventoryId: string, originalRotation: boolean, position: Inventory.XY, rotated?: boolean) => {
      const item = { ...items[itemId] };
      if (!item) return;

      if (selectedItems.indexOf(item.id) !== -1) {
        updateInventoryStore(s => ({ selectedItems: s.selectedItems.filter(id => id !== item.id) }));
      }

      const isRotated = rotated !== undefined ? rotated : originalRotation;

      // For shop/crafting we handle this in backend, ui will get updated using the itemsync evt anyway
      if (item.amount !== undefined) {
        nuiAction('inventory/getFromShop', {
          item: item.name,
          inventory: item.inventory,
          position,
          rotated: isRotated,
        });
        item.amount--;
        item.rotated = originalRotation;
        updateItem(item);
        return;
      }

      if (item.hotkey && item.inventory !== inventoryId) {
        item.hotkey = undefined;
        nuiAction('inventory/unbindItem', { id: itemId });
      }

      item.position = position;
      item.inventory = inventoryId;
      item.rotated = isRotated;
      updateItem(item);
      nuiAction('inventory/moveItem', { id: itemId, inventory: inventoryId, position, rotated: isRotated });
    },
    [items, selectedItems]
  );

  const syncItems = useCallback(
    (syncingItems: Inventory.Item[]) => {
      updateInventoryStore({ syncedItemIds: syncingItems.map(i => i.id) }); // to cancel drag

      for (const syncingItem of syncingItems) {
        // If syncing item is in a visible inventory, update it
        if (syncingItem.inventory === primaryId || syncingItem.inventory === secondaryId) {
          updateItem(syncingItem);
          continue;
        }

        // If syncing item is not in a visible inventory but still exists for us, delete it
        if (syncingItem.id in items) {
          deleteItem(syncingItem.id);
          continue;
        }
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
    (itemId: string, key: number) => {
      const item = { ...items[itemId] };

      if (!isUseable(item)) {
        addNotification({ message: 'Je kan dit item niet binden', type: 'error' });
        return;
      }

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
      addNotification({ message: `Je hebt dit item gebind aan '${key}'`, type: 'success' });
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
   * Function which finds first available space for item
   * @param itemId Item you want to find free space for
   * @param inventoryId Inventory you want to find free space in
   * @returns Position of found available position or undefined if none was found
   */
  const getFirstFreeSpace = useCallback(
    (itemId: string, inventoryId: string) => {
      const gridSize = inventories[inventoryId].size;
      const item = items[itemId];
      const rotatedItemSize = {
        x: item.size.y,
        y: item.size.x,
      };

      const occupiedSpaces = buildOccupiedGridSpaces(items, gridSize, inventoryId, itemId);

      const maxYToCheck = gridSize - Math.min(item.size.y, rotatedItemSize.y) + 1;
      const maxXToCheck = CELLS_PER_ROW - Math.min(item.size.x, rotatedItemSize.x) + 1;

      for (let y = 0; y < maxYToCheck; y++) {
        for (let x = 0; x < maxXToCheck; x++) {
          if (areSpacesNotOccupied(occupiedSpaces, { x, y }, item.size)) {
            return { position: { x, y }, rotated: false };
          }
          if (areSpacesNotOccupied(occupiedSpaces, { x, y }, rotatedItemSize)) {
            return { position: { x, y }, rotated: true };
          }
        }
      }
    },
    [inventories, items]
  );

  /**
   * Function which checks if item can be placed at provided position
   * @param itemId Item to check
   * @param inventoryId Inventory to check position in
   * @param newPosition Position to check if free
   */
  const canPlaceItemAtPosition = useCallback(
    (itemId: string, inventoryId: string, newPosition: Inventory.XY): boolean => {
      const gridSize = inventories[inventoryId].size;
      const item = items[itemId];

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

      const occupiedSpaces = buildOccupiedGridSpaces(items, gridSize, inventoryId, itemId);
      return areSpacesNotOccupied(occupiedSpaces, newPosition, itemSize);
    },
    [items, inventories]
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

  const switchItemsToOtherInventory = (itemIds: string | string[]) => {
    // if array just get first one to test shit like other inv
    const item = items[Array.isArray(itemIds) ? itemIds[0] : itemIds];
    if (!item) return;

    const targetInventoryId = getOtherInventoryId(item.inventory);

    if (Array.isArray(itemIds)) {
      // test if all items are allowed in other
      for (const itemId of itemIds) {
        const i = items[itemId];
        if (!i || !isItemAllowedInInventory(i.name, targetInventoryId)) {
          addNotification({ message: 'Dit kan hier niet in', type: 'error' });
          return;
        }
      }

      nuiAction('inventory/moveMultipleItems', { inventory: targetInventoryId, itemIds: selectedItems });
      return;
    }

    if (item.amount !== undefined && item.amount <= 0) {
      addNotification({ message: 'Dit item is out of stock', type: 'error' });
      return;
    }

    if (!areRequirementsFullfilled(item.requirements)) {
      addNotification({ message: 'Je mist iets', type: 'error' });
      return;
    }

    if (!isItemAllowedInInventory(item.name, targetInventoryId)) {
      addNotification({ message: 'Dit kan hier niet in', type: 'error' });
      return;
    }

    const freeSpace = getFirstFreeSpace(item.id, targetInventoryId);
    if (!freeSpace) {
      addNotification({ message: 'Dit past hier niet meer in', type: 'error' });
      return;
    }

    updateItemPosition(item.id, targetInventoryId, item.rotated, freeSpace.position, freeSpace.rotated);
  };

  // wouldnt let me call it useItem Sadge
  const doItemUsage = (itemId: string) => {
    const item = items[itemId];
    if (!item) return;

    if (!isUseable(item)) {
      addNotification({ message: 'Je kan dit niet gebruiken.', type: 'error' });
      return;
    }

    nuiAction('inventory/useItem', { id: item.id });

    if (item.closeOnUse ?? true) {
      closeApplication(config.name);
    } else {
      addNotification({ message: `Je hebt ${item.label} gebruikt`, type: 'success' });
    }
  };

  return {
    updateItemPosition,
    syncItems,
    unbindItem,
    bindItemToKey,
    getOtherInventoryId,
    areRequirementsFullfilled,
    canPlaceItemAtPosition,
    isItemAllowedInInventory,
    getFirstFreeSpace,
    toggleItemRotation,
    switchItemsToOtherInventory,
    doItemUsage,
  };
};
