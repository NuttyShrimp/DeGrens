import { Config } from '@dgx/server';

let blockedUpgrades: Record<string, Partial<Record<Vehicles.Upgrades.Cosmetic.Key, number[]>>> | null = null;

export const loadBlockedUpgrades = () => {
  const bUpgradesToModel = Config.getConfigValue<{
    blockedUpgrades: Record<string, Partial<Record<Vehicles.Upgrades.Cosmetic.Key, number[]>>>;
  }>('vehicles.bennys')?.blockedUpgrades;
  if (!bUpgradesToModel) return;
  blockedUpgrades = {};
  for (const [model, upgrades] of Object.entries(bUpgradesToModel)) {
    blockedUpgrades[String(GetHashKey(model) >>> 0)] = upgrades;
  }
};

export const getBlockedUpgrades = (modelHash: string) => {
  if (!blockedUpgrades) return null;
  return blockedUpgrades[modelHash];
};
