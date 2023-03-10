import { Config } from '@dgx/server';

let configData: Lockers.Config | null = null;
const config = new Proxy(
  {},
  {
    get(_: any, prop: keyof Lockers.Config) {
      if (configData == null) {
        throw new Error('Config was not loaded yet...');
      }
      return configData[prop];
    },
  }
);

on('dg-config:moduleLoaded', (module: string, data: Lockers.Config) => {
  if (module !== 'lockers') return;
  configData = data;
});

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  configData = Config.getConfigValue<Lockers.Config>('lockers');
};

export default config as Lockers.Config;
