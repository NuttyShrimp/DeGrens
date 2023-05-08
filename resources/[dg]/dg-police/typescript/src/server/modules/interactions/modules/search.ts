import { Events, Notifications, Util, Jobs, Inventory, Financials, Core } from '@dgx/server';
import { getPoliceConfig } from 'services/config';

Events.onNet('police:interactions:seizeCash', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;

  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (!target) {
    Notifications.add(src, 'Er is niemand bij je', 'error');
    return;
  }

  const targetPlayer = Core.getPlayer(target);
  if (!targetPlayer) return;

  const cash = Financials.getCash(target);
  const success = Financials.removeCash(target, cash, 'robbed-by-player');
  if (!success) return;
  Inventory.addItemToPlayer(src, 'seized_cash', 1, { amount: cash });

  Util.Log(
    'police:interactions:seizedCash',
    {
      cid: targetPlayer.citizenid,
      serverId: targetPlayer.serverId,
      name: targetPlayer.name,
      steamId: targetPlayer.steamId,
    },
    `${Util.getName(src)} has seized a players cash`,
    src
  );
});

Inventory.registerUseable('seized_cash', (src, itemState) => {
  if (Jobs.isWhitelisted(src, 'police')) {
    Notifications.add(src, 'Dit is niet de bedoeling e', 'error');
    return;
  }

  Inventory.destroyItem(itemState.id);
  const amount = itemState.metadata.amount;
  Financials.addCash(src, amount, 'opened-seized-cash');
  Util.Log(
    'police:interactions:openedSeizedCash',
    {
      amount,
    },
    `${Util.getName(src)} opened a seized cash bag`,
    src
  );
});

Events.onNet('police:interactions:patDown', async (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;

  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (!target) {
    Notifications.add(src, 'Er is niemand bij je', 'error');
    return;
  }

  const cid = Util.getCID(target);
  const illegalItems = getPoliceConfig().config.patDownItems;
  const playerItems = await Inventory.getItemsInInventory('player', String(cid));
  const hasIllegal = playerItems.some(i => illegalItems.includes(i.name));
  const message = hasIllegal ? 'Persoon lijkt iets op zak te hebben' : 'Kon niks voelen op de persoon';
  Notifications.add(src, message, hasIllegal ? 'error' : 'success');
  Notifications.add(target, 'Een agent heeft je oppervlakking gefouilleerd', 'error');
});

Events.onNet('police:interactions:search', async (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;

  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (!target) {
    Notifications.add(src, 'Er is niemand bij je', 'error');
    return;
  }

  const targetPlayer = Core.getPlayer(target);
  if (!targetPlayer) return;

  const cash = Financials.getCash(target);
  Notifications.add(src, `De persoon heeft €${cash} opzak`);
  Events.emitNet('police:interactions:searchPlayer', src, target);
  Notifications.add(target, 'Een agent is je aan het fouilleren', 'error');

  Util.Log(
    'police:interactions:searchedPlayer',
    {
      cid: targetPlayer.citizenid,
      serverId: targetPlayer.serverId,
      name: targetPlayer.name,
      steamId: targetPlayer.steamId,
    },
    `${Util.getName(src)} has searched a player`,
    src
  );
});
