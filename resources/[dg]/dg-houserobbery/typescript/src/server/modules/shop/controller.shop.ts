import { Config, Events, RPC } from '@dgx/server';

let prices: Record<string, number>;

setImmediate(async () => {
  await Config.awaitConfigLoad();
  prices = Config.getConfigValue('houserobbery.shopPrices');
});

RPC.register('houserobbery:server:canSellItem', (_src: number, itemName: string) => {
  return prices[itemName] !== undefined;
});

Events.onNet('houserobbery:server:sellItem', (src: number, itemData: { name: string; amount: number }) => {
  const amount = prices[itemData.name] * itemData.amount;
  global.exports['dg-financials'].addCash(src, amount, 'houserobbery-sell');
});
