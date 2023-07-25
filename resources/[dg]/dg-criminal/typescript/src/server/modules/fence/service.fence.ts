import { Inventory, Notifications, Financials, Util } from '@dgx/server';
import config from 'services/config';
import { fenceLogger } from './logger.fence';
import { FENCE_INVENTORY_NAME } from './constants.fence';

let currentCash = 0;
let itemPrices: Criminal.Fence.Config['items'] = {};

export const initializeFence = async () => {
  itemPrices = config.fence.items;
  Inventory.createScriptedStash(FENCE_INVENTORY_NAME, 10, Object.keys(itemPrices));
};

export const sellItem = (itemState: Inventory.ItemState<{ priceMultiplier?: number }>) => {
  if (!(itemState.name in itemPrices)) {
    fenceLogger.error('Tried to sell unsellable item');
    return;
  }

  setTimeout(async () => {
    const success = await Inventory.removeItemByIdFromInventory('stash', FENCE_INVENTORY_NAME, itemState.id);
    if (!success) return;

    const multiplier = itemState.metadata?.priceMultiplier ?? 1;
    const itemPrice = itemPrices[itemState.name] * multiplier;
    currentCash += itemPrice;

    fenceLogger.silly(`Sold item ${itemState.name} to fence for ${itemPrice}`);
    Util.Log(
      'criminal:fence:sell',
      {
        itemId: itemState.id,
        itemName: itemState.name,
        price: itemPrice,
        totalCash: currentCash,
      },
      `Sold item ${itemState.name} to fence for ${itemPrice}`
    );
  }, 5000);
};

export const takeCash = (plyId: number) => {
  if (currentCash === 0) {
    Notifications.add(plyId, 'Ik heb nog niks van je gekregen', 'error');
    return;
  }

  const cash = currentCash;
  currentCash = 0;
  Financials.addCash(plyId, cash, 'fence_take_cash');

  const plyName = Util.getName(plyId);
  fenceLogger.silly(`${plyName} took ${cash} from fence`);
  Util.Log(
    'criminal:fence:take',
    {
      amount: cash,
    },
    `${plyName} took ${cash} from fence`,
    plyId
  );
};
