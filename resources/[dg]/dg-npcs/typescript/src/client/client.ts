import { RPC } from '@dgx/client';
import handler from 'classes/handler';

setImmediate(async () => {
  const npcData = await RPC.execute<NpcData[]>('npcs:server:fetch');
  handler.initialize(npcData);
});
