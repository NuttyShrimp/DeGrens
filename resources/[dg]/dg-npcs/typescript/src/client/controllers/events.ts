import { Events } from '@dgx/client';
import handler from 'classes/handler';

Events.onNet('npcs:client:update', (data: { add?: NpcData | NpcData[]; remove?: string | string[] }) => {
  if (data.remove) {
    handler.removeNpc(data.remove);
  }
  if (data.add) {
    handler.addNpc(data.add);
  }
});
