import { Config } from '@dgx/server';

let configData: Criminal.Config | null = null;
const config = new Proxy(
  {},
  {
    get(_: any, prop: keyof Criminal.Config) {
      if (configData == null) {
        throw new Error('Config was not loaded yet...');
      }
      return configData[prop];
    },
  }
);

on('dg-config:moduleLoaded', (module: string, data: Criminal.Config) => {
  if (module !== 'restaurants') return;
  configData = data;
});

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  configData = Config.getConfigValue<Criminal.Config>('criminal');
};

export default config as Criminal.Config;
