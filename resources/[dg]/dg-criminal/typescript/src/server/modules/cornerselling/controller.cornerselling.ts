import { Config, Events, Financials, Inventory, Notifications, Police, Reputations, RPC, SQL, Util } from '@dgx/server';
import { randomSellBlackMoney } from 'modules/blackmoney/service.blackmoney';
import { getConfig } from 'services/config';
import { addSaleToHeatmap, calculatePrice, getSellableItems } from './service.cornerselling';

RPC.register('criminal:cornersell:hasSellables', async src => {
  const sellableItems = await getSellableItems(src);
  return sellableItems.length > 0;
});

Events.onNet('criminal:cornersell:sell', async (src: number) => {
  const sellableItems = await getSellableItems(src);
  const choosenItem = sellableItems[Math.floor(Math.random() * sellableItems.length)];
  const amountPlayerHas = await Inventory.getAmountPlayerHas(src, choosenItem);
  const sellAmount = getConfig().cornerselling.sellAmount;
  const amountToRemove = Math.min(amountPlayerHas, Util.getRndInteger(sellAmount.min, sellAmount.max));

  const removed = await Inventory.removeItemAmountFromPlayer(src, choosenItem, amountToRemove);
  if (!removed) {
    Notifications.add(src, 'Er is iets misgelopen', 'error');
    return;
  }

  const itemLabel = Inventory.getItemData(choosenItem)?.label ?? 'UNKNOWN';
  const plyCoords = Util.getPlyCoords(src);
  const price = calculatePrice(choosenItem, plyCoords) * amountToRemove;
  Financials.addCash(src, price, 'corner-sell');
  Notifications.add(src, `Je hebt ${amountToRemove} ${itemLabel} verkocht`);
  Util.Log(
    'cornersell:sale',
    { item: choosenItem, amount: amountToRemove, price },
    `${Util.getName(src)} has sold ${amountToRemove} ${itemLabel} during cornersell`,
    src
  );
  addSaleToHeatmap(plyCoords);
  SQL.query('INSERT INTO cornerselling_sales (coords, date) VALUES (?, NOW())', [JSON.stringify(plyCoords)]);

  // Increase rep
  const cid = Util.getCID(src);
  Reputations.setReputation(cid, 'cornersell', rep => rep + 1);

  // Chance to sell blackmoney
  if (Util.getRndInteger(1, 101) < getConfig().cornerselling.cleanChance) {
    randomSellBlackMoney(src);
  }

  // Chance for dispatch alert
  if (Util.getRndInteger(1, 101) < Config.getConfigValue('dispatch.callChance.cornersell')) {
    Police.createDispatchCall({
      tag: '10-31',
      title: 'Verdachte situatie',
      description: 'Een voorbijganger meld een verdachte situatie',
      coords: plyCoords,
      criminal: src,
      blip: {
        sprite: 102,
        color: 0,
      },
    });
  }
});
