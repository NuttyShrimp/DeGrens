import { Config } from '@dgx/server';

let config: IConfig;

export const getConfig = async (): Promise<IConfig> => {
  if (config === undefined) {
    await Config.awaitConfigLoad();
    config = Config.getModuleConfig('storerobbery');
  }
  return config;
};
