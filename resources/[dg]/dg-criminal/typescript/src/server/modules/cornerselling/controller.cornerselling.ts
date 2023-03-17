import { Config, Events, Financials, Inventory, Notifications, Police, Reputations, RPC, SQL, Util } from '@dgx/server';
import { randomSellBlackMoney } from 'modules/blackmoney/service.blackmoney';
import { addSaleToHeatmap, calculatePrice, getSellableItems } from './service.cornerselling';
import config from 'services/config';

Events.onNet('criminal:cornersell:tryToStart', async (plyId: number) => {
  const sellableItems = await getSellableItems(plyId);
  if (sellableItems.length === 0) {
    Notifications.add(plyId, 'Je hebt niks om te verkopen', 'error');
    return;
  }

  Events.emitNet('criminal:cornersell:findBuyer', plyId);
  Util.Log('cornersell:start', {}, `${Util.getName(plyId)} has started cornerselling`, plyId);
});

Events.onNet('criminal:cornersell:sell', async (plyId: number, zone: string) => {
  const sellableItemNames = await getSellableItems(plyId);
  const selectedItemName = sellableItemNames[Math.floor(Math.random() * sellableItemNames.length)];
  const selectedItemData = config.cornerselling.sellableItems[selectedItemName];
  if (!selectedItemData) {
    Notifications.add(plyId, 'Er is iets misgelopen', 'error');
    return;
  }

  const [sellAmountMin, sellAmountMax] = selectedItemData.sellAmount;
  const randomAmount = Util.getRndInteger(sellAmountMin, sellAmountMax + 1);
  const amountPlayerHas = await Inventory.getAmountPlayerHas(plyId, selectedItemName);
  const amountToRemove = Math.min(amountPlayerHas, randomAmount);

  const removed = await Inventory.removeItemByNameFromPlayer(plyId, selectedItemName, amountToRemove);
  if (!removed) {
    Notifications.add(plyId, 'Er is iets misgelopen met de verkoop!', 'error');
    Events.emitNet('criminal:cornersell:findBuyer', plyId);
    return;
  }

  const price = calculatePrice(selectedItemData, zone) * amountToRemove;
  const priceWithPoliceMultiplier = price * (Police.canDoActivity('cornersell') ? 1 : 0.5);
  Financials.addCash(plyId, priceWithPoliceMultiplier, 'corner-sell');

  Util.Log(
    'cornersell:sell',
    { itemName: selectedItemName, amount: amountToRemove, price },
    `${Util.getName(plyId)} has sold ${amountToRemove} ${selectedItemName} during cornersell`,
    plyId
  );
  addSaleToHeatmap(zone);
  SQL.query('INSERT INTO cornerselling_sales (zone, date) VALUES (?, NOW())', [zone]);

  // Increase rep
  const cid = Util.getCID(plyId);
  Reputations.setReputation(cid, 'cornersell', rep => rep + 1);

  // Chance to sell blackmoney
  if (Util.getRndInteger(1, 101) <= config.cornerselling.cleanChance) {
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
