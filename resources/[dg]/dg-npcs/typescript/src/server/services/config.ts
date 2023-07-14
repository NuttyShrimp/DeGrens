import { Config } from '@dgx/server';
import { Util } from '@dgx/shared';
import { addConfigNpcs } from './npcs';

let configLoaded = false;

export const awaitNpcConfigLoad = () => Util.awaitCondition(() => configLoaded);

export const loadNpcConfig = async () => {
  await Config.awaitConfigLoad();
  const npcConfig = Config.getModuleConfig<NPCs.NPC[]>('npcs');
  addConfigNpcs(npcConfig);
  configLoaded = true;
};

Config.onModuleLoad<NPCs.NPC[]>('npcs', npcConfig => {
  addConfigNpcs(npcConfig);
});
