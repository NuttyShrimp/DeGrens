import { Events, Inventory, RPC, Util } from '@dgx/server';
import config from 'services/config';
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

  for (const loot of config.dumpsters.loot) {
    if (Math.random() > loot.chance) continue;

    let amount: number;
    if (Array.isArray(loot.amount)) {
      const [min, max] = loot.amount;
      amount = Util.getRndInteger(min, max + 1);
    } else {
      amount = loot.amount;
    }

    Inventory.addItemToPlayer(plyId, loot.item, amount);
  }
});
