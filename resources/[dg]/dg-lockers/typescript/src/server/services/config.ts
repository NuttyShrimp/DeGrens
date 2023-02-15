import { Config } from '@dgx/server';
import { Util } from '@dgx/shared';
import { mainLogger } from 'sv_logger';

const proxyHandler = {
  get(_: any, prop: keyof Lockers.Config) {
    if (configData == null) {
      throw new Error('Config was not loaded yet...');
    }
    return configData[prop];
  },
};

let configData: Lockers.Config | null = null;
const config = new Proxy({}, proxyHandler);

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  const data = Config.getConfigValue('lockers');
  configData = data;
};

on('dg-config:moduleLoaded', (module: string, data: Lockers.Config) => {
  if (module !== 'lockers') return;
  configData = data;
  mainLogger.silly('Updated config');
});

export default config as Lockers.Config;
