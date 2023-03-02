import { Config, Events, Financials, Inventory, Notifications, Police, Reputations, RPC, SQL, Util } from '@dgx/server';
import { randomSellBlackMoney } from 'modules/blackmoney/service.blackmoney';
import { getConfig } from 'services/config';
import { addSaleToHeatmap, calculatePrice, getSellableItems } from './service.cornerselling';

Events.onNet('criminal:cornersell:tryToStart', async (plyId: number) => {
  if (!Police.canDoActivity('cornersell')) {
    Notifications.add(plyId, 'Er is momenteel geen interesse', 'error');
    return;
  }

  const sellableItems = await getSellableItems(plyId);
  if (sellableItems.length === 0) {
    Notifications.add(plyId, 'Je hebt niks om te verkopen', 'error');
    return;
  }

  Events.emitNet('criminal:cornersell:findBuyer', plyId);
  Util.Log('cornersell:start', {}, `${Util.getName(plyId)} has started cornerselling`, plyId);
});

Events.onNet('criminal:cornersell:sell', async (plyId: number, zone: string) => {
  const sellableItems = await getSellableItems(plyId);
  const choosenItem = sellableItems[Math.floor(Math.random() * sellableItems.length)];
  const amountPlayerHas = await Inventory.getAmountPlayerHas(plyId, choosenItem);
  const sellAmount = getConfig().cornerselling.sellAmount;
  const amountToRemove = Math.min(amountPlayerHas, Util.getRndInteger(sellAmount.min, sellAmount.max + 1));

  const removed = await Inventory.removeItemByNameFromPlayer(plyId, choosenItem, amountToRemove);
  if (!removed) {
    Notifications.add(plyId, 'Er is iets misgelopen met de verkoop!', 'error');
    Events.emitNet('criminal:cornersell:findBuyer', plyId);
    return;
  }

  const price = calculatePrice(choosenItem, zone) * amountToRemove;
  Financials.addCash(plyId, price, 'corner-sell');
  Util.Log(
    'cornersell:sell',
    { itemName: choosenItem, amount: amountToRemove, price },
    `${Util.getName(plyId)} has sold ${amountToRemove} ${choosenItem} during cornersell`,
    plyId
  );
  addSaleToHeatmap(zone);
  SQL.query('INSERT INTO cornerselling_sales (zone, date) VALUES (?, NOW())', [zone]);

  // Increase rep
  const cid = Util.getCID(plyId);
  Reputations.setReputation(cid, 'cornersell', rep => rep + 1);

  // Chance to sell blackmoney
  if (Util.getRndInteger(1, 101) < getConfig().cornerselling.cleanChance) {
    randomSellBlackMoney(plyId);
  }

  // Chance for dispatch alert
  if (Util.getRndInteger(1, 101) < Config.getConfigValue('dispatch.callChance.cornersell')) {
    Police.createDispatchCall({
      tag: '10-31',
      title: 'Verdachte situatie',
      description: 'Een voorbijganger meld een verdachte situatie',
      coords: Util.getPlyCoords(plyId),
      criminal: plyId,
      blip: {
        sprite: 102,
        color: 0,
      },
    });
  }

  const hasSellableItems = (await getSellableItems(plyId)).length !== 0;
  if (hasSellableItems) {
    Events.emitNet('criminal:cornersell:findBuyer', plyId);
  } else {
    Events.emitNet('criminal:cornersell:stop', plyId);
  }
});
