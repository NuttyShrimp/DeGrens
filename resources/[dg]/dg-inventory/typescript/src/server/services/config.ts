import { Config } from '@dgx/server';

let config: InventoryConfig;
export const getConfig = () => config;

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue('inventory.config');
};
