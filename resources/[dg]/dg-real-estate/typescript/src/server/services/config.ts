import { Config, Util } from '@dgx/server';

let config: Config.Config | null = null;

export const getREConfig = async () => {
  await Util.awaitCondition(() => config != null);
  if (config == null) throw new Error('Failed to get config');
  return config;
};

export const loadREConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig('realestate');
};

on('dg-config:moduleLoaded', (module: string, data: Config.Config) => {
  if (module !== 'realestate') return;
  config = data;
});
