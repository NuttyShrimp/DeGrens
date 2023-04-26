import { Util, Financials, Inventory } from '@dgx/server';
import config from 'services/config';
import { blackmoneyLogger } from './logger.blackmoney';

export const tryCleanBlackMoney = async (plyId: number, originAction: string) => {
  const originActionData = config.blackmoney.originActions[originAction];
  if (!originActionData) {
    blackmoneyLogger.error(`Provided invalid origin action: ${originAction}`);
    return;
  }

  if (Util.getRndInteger(0, 101) > originActionData.chance) return;

  const playerItems = await Inventory.getPlayerItems(plyId);
  const maxItemsAmount = Util.getRndInteger(1, originActionData.maxItemsAmount + 1);

  let choosenSellItemName: string | null = null;
  let itemIdsToSell: string[] = [];
  for (const item of playerItems) {
    const sellableData = config.blackmoney.items[item.name];
    if (!sellableData) continue; // item is not sellable

    if (choosenSellItemName === null || item.name === choosenSellItemName) {
      choosenSellItemName ??= item.name;
      itemIdsToSell.push(item.id);
    }

    if (itemIdsToSell.length >= Math.min(maxItemsAmount, sellableData.maxItemsPerSale ?? Number.POSITIVE_INFINITY))
      break;
  }

  if (choosenSellItemName === null) return;

  const removed = await Inventory.removeItemsByIdsFromPlayer(plyId, itemIdsToSell);
  if (!removed) return;

  const price = config.blackmoney.items[choosenSellItemName].value * itemIdsToSell.length;
  Financials.addCash(plyId, price, 'randomsell-blackmoney');

  const logMsg = `${Util.getName(plyId)}(${plyId}) has randomly sold ${
    itemIdsToSell.length
  }x ${choosenSellItemName} for ${price}$`;
  blackmoneyLogger.silly(logMsg);
  Util.Log(
    'blackmoney:randomSell',
    {
      plyId,
      itemId: itemIdsToSell,
      name: choosenSellItemName,
      price,
    },
    logMsg,
    plyId
  );
};
