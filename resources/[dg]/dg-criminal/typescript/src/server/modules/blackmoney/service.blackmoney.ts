import { Util, Financials, Inventory } from '@dgx/server';
import config from 'services/config';

export const randomSellBlackMoney = async (plyId: number) => {
  const items = config.blackmoney.items;
  const itemNames = Util.shuffleArray(Object.keys(items));
  const playerItems = await Inventory.getPlayerItems(plyId);
  const itemToSell = playerItems.find(i => itemNames.includes(i.name));
  if (!itemToSell) return;

  Inventory.destroyItem(itemToSell.id);

  const price = items[itemToSell.name].value;
  Financials.addCash(plyId, price, 'randomsell-blackmoney');
  Util.Log(
    'blackmoney:randomSell',
    { plyId, itemId: itemToSell.id, name: itemToSell.name, price },
    `${Util.getName(plyId)} has randomly sold ${itemToSell.name} for ${price}$`,
    plyId
  );
};
