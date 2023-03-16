import { Events, Inventory } from '@dgx/server';

Inventory.registerUseable('parachute', plyId => {
  Events.emitNet('misc:parachute:toggle', plyId);
});
