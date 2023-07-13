import { Config } from '@dgx/server';
import { Util } from '@dgx/shared';
import { addConfigNpcs } from './npcs';

let configLoaded = false;

export const awaitNpcConfigLoad = () => Util.awaitCondition(() => configLoaded);

export const loadNpcConfig = async () => {
  await Config.awaitConfigLoad();
  const npcConfig = Config.getModuleConfig<NpcData[]>('npcs');
  addConfigNpcs(npcConfig);
  configLoaded = true;
};

Config.onModuleLoad<NpcData[]>('npcs', npcConfig => {
  addConfigNpcs(npcConfig);
});
