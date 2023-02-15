import { Config } from '@dgx/server';

let configData: Restaurants.Config | null = null;
const config = new Proxy(
  {},
  {
    get(_: any, prop: keyof Restaurants.Config) {
      if (configData == null) {
        throw new Error('Config was not loaded yet...');
      }
      return configData[prop];
    },
  }
);

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  configData = Config.getConfigValue<Restaurants.Config>('restaurants');
};

on('dg-config:moduleLoaded', (module: string, data: Restaurants.Config) => {
  if (module !== 'restaurants') return;
  configData = data;
});

export default config as Restaurants.Config;
