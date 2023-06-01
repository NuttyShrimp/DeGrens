import { Config } from '@dgx/server';

let blockedUpgrades: Record<string, Partial<Record<keyof Vehicles.Upgrades.Cosmetic, number[]>>> | null = null;

export const loadBlockedUpgrades = () => {
  const bUpgradesToModel = Config.getConfigValue<{
    blockedUpgrades: Record<string, Partial<Record<keyof Vehicles.Upgrades.Cosmetic, number[]>>>;
  }>('vehicles.bennys')?.blockedUpgrades;
  if (!bUpgradesToModel) return;
  blockedUpgrades = {};
  for (const [model, upgrades] of Object.entries(bUpgradesToModel)) {
    blockedUpgrades[String(GetHashKey(model))] = upgrades;
  }
};

export const getBlockedUpgrades = (modelHash: string) => {
  if (!blockedUpgrades) return null;
  return blockedUpgrades[modelHash];
};
