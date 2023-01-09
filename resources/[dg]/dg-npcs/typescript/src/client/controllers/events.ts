import { Events } from '@dgx/client';
import handler from 'classes/handler';

Events.onNet('npcs:client:loadConfig', (npcData: NpcData[]) => {
  handler.loadConfig(npcData);
});
