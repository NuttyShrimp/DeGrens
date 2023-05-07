import { Inventory } from '@dgx/server';
import { getConfig } from 'services/config';
import { BLAZEIT_VENDING_INVENTORY } from '../../../shared/modules/constants.blazeit';

export const initializeBlazeIt = () => {
  const items = getConfig().businesses.blazeit.priceItems;

  // we preload to enforce allowed items
  Inventory.createScriptedStash(BLAZEIT_VENDING_INVENTORY, 50, items);
};
