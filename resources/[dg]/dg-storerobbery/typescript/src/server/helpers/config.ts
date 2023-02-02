import { Config } from '@dgx/server';

let config: Storerobbery.Config;

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig('storerobbery');
};

export const getConfig = () => {
  return config;
};
