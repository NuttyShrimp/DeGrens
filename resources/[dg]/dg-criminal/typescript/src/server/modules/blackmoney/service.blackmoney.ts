import { Util, Financials, Inventory } from '@dgx/server';
import { getConfig } from 'services/config';

export const randomSellBlackMoney = async (plyId: number) => {
  const items = getConfig().blackmoney.items;
  const itemNames = Object.keys(items);
  const selectedItem = itemNames[Math.floor(Math.random() * itemNames.length)];
  const removedItem = await Inventory.removeItemFromPlayer(plyId, selectedItem);
  if (removedItem === false) return;

  const price = items[selectedItem].value;
  Financials.addCash(plyId, price, 'randomsell-blackmoney');
  Util.Log(
    'blackmoney:randomSell',
    { plyId, item: selectedItem, price },
    `${GetPlayerName(String(plyId))} has randomly sold ${selectedItem} for ${price}$`,
    plyId
  );
};
