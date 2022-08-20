import { Config } from '@dgx/server';

let config: InventoryConfig;
export const getConfig = () => config;

setImmediate(async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue('inventory.config');
});

on('dg-config:moduleLoaded', (moduleId: string) => {
  if (moduleId !== 'inventory.config') return;
  config = Config.getConfigValue('inventory.config');
});
