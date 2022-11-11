import { Inventory } from '@dgx/server';
import { addItemToRecycle } from './service.recycleped';

Inventory.onInventoryUpdate(
  'player',
  (identifier, _, itemState) => {
    // itemstate.inventory is the inventory item was moved to
    if (itemState.inventory !== 'stash__materials_recycleped') return;
    addItemToRecycle(identifier, itemState);
  },
  undefined,
  'remove'
);
