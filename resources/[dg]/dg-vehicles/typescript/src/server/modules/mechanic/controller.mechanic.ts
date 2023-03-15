import { Auth, Events, Inventory, RPC } from '@dgx/server';

import { clockPlayerIn, clockPlayerOut, loadConfig, loadZones } from './service.mechanic';
import { openPartsMenu, getOrderMenu, finishOrder, craftPart } from './services/parts.mechanic';
import { attachVehicleToTowVehicle, removeVehicleFromTowVehicle, tryAcceptingJob } from './services/towing.mechanic';

setImmediate(() => {
  loadConfig();
});

Auth.onAuth(src => {
  loadZones(src);
});

Events.onNet('vehicles:mechanic:setClockStatus', (src, shop: string, isClockedIn: boolean) => {
  isClockedIn ? clockPlayerIn(src, shop) : clockPlayerOut(src);
});

Events.onNet('vehicles:mechanic:server:acceptTowJob', tryAcceptingJob);

global.exports('calculateSalesTicketsPrice', async (ticketItem: Inventory.ItemState) => {
  const { items } = ticketItem.metadata as Mechanic.TicketMetadata;
  const ticketRevenues = await Promise.all(
    items.map(async item => {
      // only repair parts need to be used, tunes will always still exist
      if (item.type === 'repair') {
        const itemState = await Inventory.getItemStateFromDatabase(item.itemId);
        if (itemState) return 0;
      }
      return item.amount;
    })
  );

  return ticketRevenues.reduce((acc, cur) => acc + cur, 0);
});

Events.onNet('vehicles:mechanic:openPartsMenu', openPartsMenu);

Events.onNet('vehicles:mechanic:createPart', craftPart);

RPC.register('vehicles:mechanic:getOrderMenu', getOrderMenu);

Events.onNet('vehicles:mechanic:finishOrder', finishOrder);

Events.onNet('vehicles:towing:tow', (plyId, towVehicleNetId: number, attachVehicleNetId) => {
  attachVehicleToTowVehicle(towVehicleNetId, attachVehicleNetId);
});

Events.onNet('vehicles:towing:remove', (plyId, towVehicleNetId: number) => {
  removeVehicleFromTowVehicle(towVehicleNetId);
});
