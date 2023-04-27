import { Config } from '@dgx/server';

let configData: Blackout.Config | null = null;
const config = new Proxy(
  {},
  {
    get(_: any, prop: keyof Blackout.Config) {
      if (configData == null) {
        throw new Error('Config was not loaded yet...');
      }
      return configData[prop];
    },
  }
);

on('dg-config:moduleLoaded', (module: string, data: Blackout.Config) => {
  if (module !== 'blackout') return;
  configData = data;
});

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  configData = Config.getConfigValue<Blackout.Config>('blackout');
};

export default config as Blackout.Config;
