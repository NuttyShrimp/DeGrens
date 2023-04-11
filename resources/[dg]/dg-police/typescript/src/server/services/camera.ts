import { Events, Inventory } from '@dgx/server';

Inventory.registerUseable('pd_camera', plyId => {
  Events.emitNet('police:camera:use', plyId);
});
