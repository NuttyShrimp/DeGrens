import { Config } from '@dgx/server';

let configData: Heists.Config | null = null;
const config = new Proxy(
  {},
  {
    get(_: any, prop: keyof Heists.Config) {
      if (configData == null) {
        throw new Error('Config was not loaded yet...');
      }
      return configData[prop];
    },
  }
);

on('dg-config:moduleLoaded', (module: string, data: Heists.Config) => {
  if (module !== 'heists') return;
  configData = data;
});

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  configData = Config.getConfigValue<Heists.Config>('heists');
};

export default config as Heists.Config;
