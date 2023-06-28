import { Events, Inventory, RPC } from '@dgx/server';

import { loadConfig } from './service.mechanic';
import { openPartsMenu, getOrderMenu, finishOrder, craftPart } from './services/parts.mechanic';
import { attachVehicleToTowVehicle, removeVehicleFromTowVehicle, tryAcceptingJob } from './services/towing.mechanic';

setImmediate(() => {
  loadConfig();
});

Events.onNet('vehicles:mechanic:server:acceptTowJob', tryAcceptingJob);

global.exports('calculateSalesTicketsPrice', async (ticketItem: Inventory.ItemState) => {
  const { items } = ticketItem.metadata as Mechanic.TicketMetadata;
  const ticketRevenues = await Promise.all(
    items.map(async item => {
      const itemState = await Inventory.getItemStateFromDatabase(item.itemId);

      let priceForItem = item.amount;
      switch (item.type) {
        case 'repair':
          // repair parts need to be destroyed/used to receive money
          if (itemState) {
            priceForItem = 0;
          }
          break;
        case 'tune':
          // tune parts need to exist and be in a tunes inventory to receive money
          if (!itemState || Inventory.splitId(itemState.inventory).type !== 'tunes') {
            priceForItem = 0;
          }
          break;
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
