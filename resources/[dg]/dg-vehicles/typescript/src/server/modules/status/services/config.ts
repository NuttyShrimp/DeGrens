import { Config, Events } from '@dgx/server';
let config: Service.Config;

on('dg-config:moduleLoaded', (module: string, data: Service.Config) => {
  if (module !== 'vehicles.service') return;
  config = data;
  Events.emitNet('vehicles:service:setDegradationValues', -1, config.degradationValues);
});

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue('vehicles.service');
};

export const getConfig = async () => {
  if (!config) {
    await loadConfig();
  }
  return config;
};
