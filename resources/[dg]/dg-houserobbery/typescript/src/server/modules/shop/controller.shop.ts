import { Config, Events, RPC, Util } from '@dgx/server';

let prices: Record<string, number>;

setImmediate(async () => {
  await Config.awaitConfigLoad();
  prices = Config.getConfigValue('houserobbery.shopPrices');
});

RPC.register('houserobbery:server:canSellItem', (_src: number, itemName: string) => {
  return prices[itemName] !== undefined;
});

Events.onNet('houserobbery:server:sellItem', (src: number, itemData: { name: string; amount: number }) => {
  const price = prices[itemData.name] * itemData.amount;
  Util.Log(
    'houserobbery:sellItem',
    {
      ...itemData,
      price,
    },
    `${src} sold ${itemData.amount} ${itemData.name} for ${price}`,
    src
  );
  global.exports['dg-financials'].addCash(src, price, 'houserobbery-sell');
});
