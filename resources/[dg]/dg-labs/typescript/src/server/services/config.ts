import { Config } from '@dgx/server';

let configData: Labs.Config | null = null;
const config = new Proxy(
  {},
  {
    get(_: any, prop: keyof Labs.Config) {
      if (configData == null) {
        throw new Error('Config was not loaded yet...');
      }
      return configData[prop];
    },
  }
);

on('dg-config:moduleLoaded', (module: string, data: Labs.Config) => {
  if (module !== 'labs') return;
  configData = data;
});

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  configData = Config.getConfigValue<Labs.Config>('labs');
};

export default config as Labs.Config;
