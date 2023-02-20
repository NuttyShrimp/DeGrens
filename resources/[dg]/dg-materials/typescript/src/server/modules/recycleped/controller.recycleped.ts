import { Inventory } from '@dgx/server';
import { addItemToRecycle } from './service.recycleped';

Inventory.onInventoryUpdate(
  'player',
  (identifier, _, itemState) => {
    // itemstate.inventory is the inventory item was moved to
    if (itemState.inventory !== Inventory.concatId('stash', 'materials_recycleped')) return;
    addItemToRecycle(identifier, itemState);
  },
  undefined,
  'remove'
);
