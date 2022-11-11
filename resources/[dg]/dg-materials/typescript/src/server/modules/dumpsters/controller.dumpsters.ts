import { Events, Inventory, RPC } from '@dgx/server';
import { getConfig } from 'services/config';
import { mainLogger } from 'sv_logger';
import { isSearched, setAsSearched } from './service.dumpsters';

RPC.register('materials:dumpsters:startSearch', (src, position: Vec3) => {
  if (isSearched(position)) return false;
  setAsSearched(position);
  return true;
});

Events.onNet('materials:dumpsters:finishSearch', (src: number, position: Vec3) => {
  if (!isSearched(position)) {
    mainLogger.warn('Tried to finish search but search was never started for dumpster');
    return;
  }

  getConfig().dumpsters.loot.forEach(loot => {
    if (Math.random() < loot.chance) {
      Inventory.addItemToPlayer(src, loot.item, 1);
    }
  });
});
