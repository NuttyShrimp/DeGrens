import { Config, Events } from '@dgx/server';
import { Util } from '@dgx/shared';

let config: NpcData[] | null = null;

export const getNpcConfig = async () => {
  await Util.awaitCondition(() => config != null);
  if (config == null) throw new Error('Failed to get config');
  return config;
};

export const loadNpcConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig('npcs');
};

on('dg-config:moduleLoaded', (module: string, npcData: NpcData[]) => {
  if (module !== 'npcs') return;
  config = npcData;
  Events.emitNet('npcs:client:loadConfig', -1, npcData);
});
