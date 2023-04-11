import { Events, Inventory, Screenshot, UI } from '@dgx/server';

Inventory.registerUseable('pd_camera', plyId => {
  Events.emitNet('police:camera:use', plyId);
});

Events.onNet('police:camera:takePicture', async plyId => {
  const imageLink = await Screenshot.imgur(plyId);
  UI.addToClipboard(plyId, imageLink);
});
