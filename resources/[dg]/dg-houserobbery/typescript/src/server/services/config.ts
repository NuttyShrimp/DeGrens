import { Config } from '@dgx/server';

let config: Houserobbery.Config | null = null;
let locations: Houserobbery.Locations | null = null;
let shellTypes: Record<string, string> | null = null;
const itemsPerLootTable = new Map<number, string[]>();

const setConfig = (newConfig: Houserobbery.FullConfig) => {
  const { config: c, ...l } = newConfig;

  config = c;
  locations = l;

  shellTypes = Object.entries(getConfig().shellInfo).reduce<Record<string, string>>(
    (acc, [name, shell]: [string, any]) => {
      acc[name] = shell.plan;
      return acc;
    },
    {}
  );

  for (const loot of c.lootTable) {
    const items = itemsPerLootTable.get(loot.lootTableId) ?? [];
    for (let i = 0; i < loot.weight; i++) {
      items.push(loot.itemName);
    }
    itemsPerLootTable.set(loot.lootTableId, items);
  }
};

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  const c = Config.getConfigValue<Houserobbery.FullConfig>('houserobbery');
  setConfig(c);
};

on('dg-config:moduleLoaded', (module: string, c: Houserobbery.FullConfig) => {
  if (module !== 'houserobbery') return;
  setConfig(c);
});

export const getConfig = () => {
  if (config == null) {
    throw new Error('Config was not loaded yet');
  }
  return config;
};

export const getLocations = () => {
  if (locations == null) {
    throw new Error('Config was not loaded yet');
  }
  return locations;
};

export const getShellTypes = () => {
  if (shellTypes == null) {
    throw new Error('Config was not loaded yet');
  }
  return shellTypes;
};

export const getItemsForLootTable = (lootTableId: number) => itemsPerLootTable.get(lootTableId) ?? [];
