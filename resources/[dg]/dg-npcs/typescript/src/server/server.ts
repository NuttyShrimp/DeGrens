import { Config, RPC } from '@dgx/server/classes';

RPC.register('npcs:server:fetch', async (): Promise<NpcData[]> => {
  await Config.awaitConfigLoad();
  const NPC_DATA: NpcData[] = Config.getModuleConfig('npcs');
  return NPC_DATA;
});
