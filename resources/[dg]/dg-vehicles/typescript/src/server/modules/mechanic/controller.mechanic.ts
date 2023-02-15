import { Auth, Events, Inventory, RPC } from '@dgx/server';

import {
  clockPlayerIn,
  clockPlayerOut,
  getAmountOfItem,
  getRevenueForItem,
  giveOrder,
  loadConfig,
  loadZones,
  moveCraftedItemToShopParts,
  tryAcceptingJob,
} from './service.mechanic';

setImmediate(() => {
  loadConfig();
});

Auth.onAuth(src => {
  loadZones(src);
});

Events.onNet('vehicles:mechanic:setClockStatus', (src, shop: string, isClockedIn: boolean) => {
  isClockedIn ? clockPlayerIn(src, shop) : clockPlayerOut(src);
});

Events.onNet('vehicles:mechanic:server:itemOrder', (src, order: Mechanic.Tickets.Item[]) => {
  giveOrder(src, order);
});

Events.onNet('vehicles:mechanic:server:acceptTowJob', (src, vin: string) => {
  tryAcceptingJob(src, vin);
});

RPC.register('vehicles:mechanic:server:getStashAmount', (src, item: Mechanic.Tickets.Item) => {
  return getAmountOfItem(src, item);
});

on('inventory:craftedInBench', (plyId: number, benchId: string, item: Inventory.ItemState) => {
  if (benchId !== 'mechanic_bench') return;
  moveCraftedItemToShopParts(plyId, item);
});

global.exports('calculateSalesTicketsPrice', async (ticketItem: Inventory.ItemState) => {
  const data = ticketItem.metadata as Mechanic.Tickets.ItemMetadata;
  const ticketRevenues = await Promise.all(
    data.items.map(async i => {
      let amountOfIdsThatDontExistAnymore = 0;
      for (const id of i.ids) {
        const itemState = await Inventory.getItemStateFromDatabase(id);
        // If item still exists then dont pay out anything
        if (itemState && itemState.name === i.name) continue;
        amountOfIdsThatDontExistAnymore++;
      }
      return getRevenueForItem(i) * amountOfIdsThatDontExistAnymore;
    })
  );

  return ticketRevenues.reduce((acc, cur) => acc + cur, 0);
});
