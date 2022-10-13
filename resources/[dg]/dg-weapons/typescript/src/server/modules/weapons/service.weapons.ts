import { Events, Inventory, Util } from '@dgx/server';
import { getWeaponAmmo } from 'modules/ammo/service.ammo';
import { getConfig, getWeaponConfig } from 'services/config';
import { mainLogger } from 'sv_logger';

export const registerUseableWeapons = () => {
  const weaponNames = Object.values(getConfig().weapons).map(w => w.name);

  Inventory.registerUseable(weaponNames, (src, itemState) => {
    const weaponConfig = getWeaponConfig(itemState.name);
    if (!weaponConfig) return;

    const weaponData: Weapons.WeaponItem = {
      ...itemState,
      hash: GetHashKey(itemState.name),
      oneTimeUse: weaponConfig.oneTimeUse ?? false,
      noHolstering: weaponConfig.noHolstering ?? false,
      canTint: weaponConfig.canTint ?? false,
    };

    const ammoCount = getWeaponAmmo(itemState.id);
    Events.emitNet('weapons:client:useWeapon', src, weaponData, ammoCount);
  });
};

export const getWeaponItemState = (itemId: string) => {
  const itemState = Inventory.getItemStateById(itemId);
  if (!itemState) {
    mainLogger.error(`Could not find weaponitem with id ${itemId}`);
    Util.Log('weapons:couldNotFindItem', { itemId }, `Could not find weaponitem with id ${itemId}`, undefined, true);
    return;
  }
  return itemState;
};

export const setWeaponQuality = (itemId: string, quality: number) => {
  Inventory.setQualityOfItem(itemId, () => quality);
};
