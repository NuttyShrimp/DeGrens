import { Events, Inventory, Notifications, RPC, Util } from '@dgx/server';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import { isSearched, setAsSearched } from './service.searchableprops';

RPC.register('materials:searchableprops:start', (plyId, propType: string, position: Vec3) => {
  if (isSearched(propType, position)) return false;
  setAsSearched(propType, position);
  return true;
});

Events.onNet('materials:searchableprops:finish', (plyId, propType: string, position: Vec3) => {
  if (!isSearched(propType, position)) {
    mainLogger.warn('Tried to finish search but search was never started for searchable prop');
    return;
  }

  let receivedAnItem = false;
  for (const loot of config.searchableprops[propType]?.loot ?? []) {
    if (Math.random() > loot.chance) continue;

    const amount = Array.isArray(loot.amount) ? Util.getRndInteger(loot.amount[0], loot.amount[1] + 1) : loot.amount;
    Inventory.addItemToPlayer(plyId, loot.item, amount);
    receivedAnItem = true;
  }

  if (!receivedAnItem) {
    Notifications.add(plyId, 'Je hebt niks gevonden...', 'error');
  }
});
