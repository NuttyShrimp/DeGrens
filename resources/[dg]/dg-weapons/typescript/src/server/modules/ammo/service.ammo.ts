import { Events, Inventory, Util } from '@dgx/server';
import { getWeaponItemState } from 'modules/weapons/service.weapons';
import { getConfig, getWeaponConfig } from 'services/config';

export const registerUseableAmmo = () => {
  const items = Object.keys(getConfig().ammo);
  Inventory.registerUseable(items, (src, item) => {
    Events.emitNet('weapons:client:useAmmo', src, item.name);
  });
};

export const getWeaponAmmo = (itemId: string) => {
  const itemState = getWeaponItemState(itemId);
  if (!itemState) return;

  const weaponConfig = getWeaponConfig(itemState.name);
  if (!weaponConfig) return 0;

  if (weaponConfig.oneTimeUse) return 1;
  if (weaponConfig.unlimitedAmmo) return 9999;

  return Number(itemState.metadata.ammo ?? 1);
};

export const setWeaponAmmo = (itemId: string, amount: number) => {
  Inventory.setMetadataOfItem(itemId, metadata => ({
    ...metadata,
    ammo: amount,
  }));
  Util.Log(
    'weapons:savedAmmo',
    { itemId, ammoAmount: amount },
    `Ammoamount for weaponitem ${itemId} has been updated to ${amount}`
  );
};
