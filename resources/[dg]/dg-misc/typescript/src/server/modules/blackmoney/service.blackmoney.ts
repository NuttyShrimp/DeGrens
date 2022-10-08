import { Config, Financials, Inventory, Util } from '@dgx/server';

export const randomSellBlackMoney = async (plyId: number) => {
  await Config.awaitConfigLoad();
  const config = Config.getModuleConfig<config>('blackmoney');

  const selectedItem = config.items[Math.floor(Math.random() * config.items.length)];
  const removedItem = await Inventory.removeItemFromPlayer(plyId, selectedItem);
  if (removedItem === false) return;

  const itemWorth = config.worth[selectedItem];
  const price = Util.getRndInteger(itemWorth.min, itemWorth.max);
  Financials.addCash(plyId, price, 'randomsell-blackmoney');
  Util.Log(
    'blackmoney:randomSell',
    { plyId, item: selectedItem, price },
    `${GetPlayerName(String(plyId))} has randomly sold ${selectedItem} for ${price}$`,
    plyId
  );
};

type config = { items: string[]; worth: Record<string, random> };
type random = { min: number; max: number };
