import { Config, Events, Inventory, Notifications, RPC, Util } from '@dgx/server';
import { WEAPONS } from 'contants';
import { getAmmoInWeaponItem } from 'helpers/util';
import { mainLogger } from 'sv_logger';
import { addAttachment } from './attachments';

let config: Weapons.Config | null = null;

export const getConfig = () => {
  if (config === null) throw new Error('Tried to get config but was not loaded');
  return config;
};

export const loadConfig = () => {
  config = Config.getModuleConfig<Weapons.Config>('weapons');

  // Using ammo
  Inventory.registerUseable(Object.keys(config.ammo), (src, item) => {
    Events.emitNet('weapons:client:useAmmo', src, item.name);
  });

  // Using attachments
  Inventory.registerUseable(config.attachments, async (src, item) => {
    const weaponData = await RPC.execute<Weapons.WeaponItem | null>('weapons:client:getWeaponData', src);
    if (!weaponData) {
      Notifications.add(src, 'Je hebt geen wapen vast', 'error');
      return;
    }
    addAttachment(src, weaponData, item);
  });

  // Using weapons
  const weaponNames = Object.values(WEAPONS).map(w => w.name);
  Inventory.registerUseable(weaponNames, (src, item) => {
    const hash = GetHashKey(item.name);
    const weaponConfig = WEAPONS[hash];
    if (!weaponConfig) {
      mainLogger.error(`Could not find weapon config of ${item.name}`);
      Util.Log(
        'weapons:noConfig',
        { item },
        `Could not get weapon config for weapon when trying to use weapon`,
        src,
        true
      );
      return;
    }

    const weaponData: Weapons.WeaponItem = {
      ...item,
      hash,
      oneTimeUse: weaponConfig.oneTimeUse ?? false,
      noHolstering: weaponConfig.noHolstering ?? false,
    };
    const ammoCount = getAmmoInWeaponItem(item.id);
    Events.emitNet('weapons:client:useWeapon', src, weaponData, ammoCount);
  });
};
