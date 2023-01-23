import { Config } from '@dgx/server';

let config: IConfig;

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig('storerobbery');
};

export const getConfig = () => {
  return config;
};
