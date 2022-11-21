import { Config } from '@dgx/server';
import { Util } from '@dgx/shared';

let config: Criminal.Config | null = null;

export const awaitConfig = () => Util.awaitCondition(() => config !== null);

export const getConfig = () => {
  if (config === null) {
    throw new Error('Tried to get config but was not initialized yet...');
  }
  return config;
};

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue('criminal');
};
