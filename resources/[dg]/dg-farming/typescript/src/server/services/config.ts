import { Config } from '@dgx/server';

let configData: Farming.Config | null = null;
const config = new Proxy(
  {},
  {
    get(_: any, prop: keyof Farming.Config) {
      if (configData == null) {
        throw new Error('Config was not loaded yet...');
      }
      return configData[prop];
    },
  }
);

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  configData = Config.getConfigValue<Farming.Config>('farming');
};

on('dg-config:moduleLoaded', (module: string, data: Farming.Config) => {
  if (module !== 'farming') return;
  configData = data;
});

export default config as Farming.Config;
