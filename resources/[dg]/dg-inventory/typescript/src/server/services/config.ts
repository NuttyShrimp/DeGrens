import { Config, Util } from '@dgx/server';

let config: InventoryConfig | null = null;

export const getConfig = () => {
  if (config == null) {
    throw new Error('Tried to get inventory config but was not loaded yet');
  }
  return config;
};

export const awaitConfigLoad = () => Util.awaitCondition(() => config != null);

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue('inventory.config');
};
