import { Events, Inventory } from '@dgx/client';

Events.onNet('police:interactions:searchPlayer', (plyId: number) => {
  Inventory.openOtherPlayer(plyId);
});
