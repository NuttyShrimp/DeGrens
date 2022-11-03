import { Config, Inventory, Notifications, Financials, Util } from '@dgx/server';

let currentMoney = 0;
let prices: Record<string, number>;

export const initializeShop = async () => {
  await Config.awaitConfigLoad();
  prices = Config.getConfigValue('houserobbery.shopPrices');
  Inventory.createScriptedStash('houserobbery_sell', 10, Object.keys(prices));
};

export const addItemToSell = (sellItem: Inventory.ItemState) => {
  setTimeout(async () => {
    const success = await Inventory.removeItemByIdFromInventory('stash', 'houserobbery_sell', sellItem.id);
    if (!success) return;
    currentMoney += prices[sellItem.name];
  }, 5000);
};

export const takeSellCash = (plyId: number) => {
  if (currentMoney === 0) {
    Notifications.add(plyId, 'Je hebt nog niks verkocht', 'error');
    return;
  }

  Financials.addCash(plyId, currentMoney, 'houserobbery-sell');
  Util.Log(
    'houserobbery:sell:take',
    {
      price: currentMoney,
    },
    `${Util.getName(plyId)} took ${currentMoney} from houserobbery sell`,
    plyId
  );
  currentMoney = 0;
};
