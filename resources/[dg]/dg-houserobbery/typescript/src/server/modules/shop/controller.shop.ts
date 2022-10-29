import { Events, Financials, Inventory, RPC, Util } from '@dgx/server';
import { addItemToSell, takeSellCash } from './service.shop';

Events.onNet('houserobbery:server:takeSellCash', (src: number) => {
  takeSellCash(src);
});

Inventory.onInventoryUpdate(
  'stash',
  (identifier, _, itemState) => {
    if (identifier !== 'houserobbery_sell') return;
    addItemToSell(itemState);
  },
  undefined,
  'add'
);
