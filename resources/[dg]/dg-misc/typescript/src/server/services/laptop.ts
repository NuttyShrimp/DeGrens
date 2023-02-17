import { Events, Inventory } from '@dgx/server';

Inventory.registerUseable('laptop', src => {
  Events.emitNet('misc:client:openLaptop', src);
});
