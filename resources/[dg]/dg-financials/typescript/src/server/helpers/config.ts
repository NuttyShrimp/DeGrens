import { Config } from '@dgx/server';

let config: Config = null;

export const getConfig = () => config;

export const getConfigModule = async <T extends keyof Config>(mod: T): Promise<Config[T]> => {
  await Config.awaitConfigLoad();
  return config?.[mod];
};

export const setConfig = (cfg: Config) => {
  config = cfg;
};
