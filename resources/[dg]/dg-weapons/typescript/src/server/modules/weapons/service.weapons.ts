import { Events, Inventory, Util } from '@dgx/server';
import { getConfig, getWeaponConfig } from 'services/config';
import { mainLogger } from 'sv_logger';

const equippedWeapons: Map<number, number> = new Map();

export const setEquippedWeapon = (src: number, weaponHash: number) => {
  equippedWeapons.set(src, weaponHash);
};

export const getEquippedWeapon = (src: number) => {
  let weaponHash = equippedWeapons.get(src);
  if (weaponHash === undefined) {
    Util.Log(
      'weapons:noWeaponRegistered',
      {},
      `${Util.getName(src)} did not have a weapon registered to him (Should default to UNARMED)`,
      src,
      true
    );
    mainLogger.error(`${Util.getName(src)} did not have a weapon registered to him (Should default to unarmed)`);
    weaponHash = GetHashKey('WEAPON_UNARMED');
    setEquippedWeapon(src, weaponHash);
  }
  return weaponHash;
};

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

    Events.emitNet('weapons:client:useWeapon', src, weaponData);
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
