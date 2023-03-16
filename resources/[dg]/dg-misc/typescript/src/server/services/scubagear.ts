import { Events, Inventory } from '@dgx/server';

Inventory.registerUseable('scuba_gear', plyId => {
  Events.emitNet('misc:scubagear:toggle', plyId);
});
