import { Events, Inventory } from '@dgx/server';
import { sellItem, takeCash } from './service.fence';
import { FENCE_INVENTORY_NAME } from './constants.fence';

Events.onNet('criminal:fence:takeCash', (src: number) => {
  takeCash(src);
});

Inventory.onInventoryUpdate(
  'stash',
  (identifier, _, itemState) => {
    if (identifier !== FENCE_INVENTORY_NAME) return;
    sellItem(itemState);
  },
  undefined,
  'add'
);
