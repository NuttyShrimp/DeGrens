import { Events, Inventory, RPC, Util } from '@dgx/server';
import { getConfig } from 'services/config';
import { mainLogger } from 'sv_logger';
import { isSearched, setAsSearched } from './service.dumpsters';

RPC.register('materials:dumpsters:startSearch', (src, position: Vec3) => {
  if (isSearched(position)) return false;
  setAsSearched(position);
  return true;
});

Events.onNet('materials:dumpsters:finishSearch', (plyId: number, position: Vec3) => {
  if (!isSearched(position)) {
    mainLogger.warn('Tried to finish search but search was never started for dumpster');
    return;
  }

  for (const loot of getConfig().dumpsters.loot) {
    if (Math.random() > loot.chance) continue;

    const [min, max] = loot.amount;
    const amount = Util.getRndInteger(min, max + 1);
    Inventory.addItemToPlayer(plyId, loot.item, amount);
  }
});
