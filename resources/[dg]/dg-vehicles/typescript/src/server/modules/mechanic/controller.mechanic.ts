import { Auth, Events, Inventory, RPC } from '@dgx/server';

import {
  clockPlayerIn,
  clockPlayerOut,
  getAmountOfItem,
  giveOrder,
  loadConfig,
  loadZones,
  moveCraftedItemToShopParts,
  tradeSalesTickets,
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

Events.onNet('vehicles:mechanic:server:tradeTickets', src => {
  tradeSalesTickets(src);
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
