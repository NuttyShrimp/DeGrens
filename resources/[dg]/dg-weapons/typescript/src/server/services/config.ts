import { Config, Util } from '@dgx/server';
import { ALL_WEAPONS } from 'contants';
import { mainLogger } from 'sv_logger';

let config: Weapons.Config | null = null;

export const getConfig = () => {
  if (config === null) throw new Error('Tried to get config but was not loaded');
  return config;
};

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  const cfg = Config.getModuleConfig<Omit<Weapons.Config, 'weapons'>>('weapons');
  const weapons = ALL_WEAPONS.reduce<Record<string, Weapons.WeaponConfig>>((acc, cur) => {
    acc[cur.name] = cur;
    return acc;
  }, {});
  config = { ...cfg, weapons };
};

export const getWeaponConfig = (weapon: string, noLogs = false) => {
  const weaponConfig = getConfig().weapons[weapon];
  if (!weaponConfig && !noLogs) {
    mainLogger.error(`Could not find weapon config of ${weapon}`);
    Util.Log('weapons:noConfig', { weapon }, `Could not get weapon config for weapon`, undefined, true);
    return;
  }
  return weaponConfig;
};
