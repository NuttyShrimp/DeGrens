import { Config } from '@dgx/server';
import { Util } from '@dgx/shared';

let materialsConfig: Materials.Config | null = null;

export const awaitConfigLoad = () => Util.awaitCondition(() => materialsConfig !== null);

export const getConfig = () => {
  if (materialsConfig === null) {
    throw new Error('Tried to get config but was not initialized yet...');
  }
  return materialsConfig;
};

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  materialsConfig = Config.getConfigValue('materials');
};
