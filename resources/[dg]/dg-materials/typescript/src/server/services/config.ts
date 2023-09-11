import { Config } from '@dgx/server';

const CONFIG_KEY = 'materials';

let configData: Materials.Config | null = null;
const config = new Proxy(
  {},
  {
    get(_: any, prop: keyof Materials.Config) {
      if (configData == null) {
        throw new Error('Config was not loaded yet...');
      }
      return configData[prop];
    },
  }
);

on('dg-config:moduleLoaded', (module: string, data: Materials.Config) => {
  if (module !== CONFIG_KEY) return;
  configData = data;
});

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  configData = Config.getConfigValue<Materials.Config>(CONFIG_KEY);
};

export default config as Materials.Config;
