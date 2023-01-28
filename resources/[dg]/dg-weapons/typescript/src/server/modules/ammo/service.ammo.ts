import { Events, Inventory, Util } from '@dgx/server';
import { getConfig, getWeaponConfig } from 'services/config';

export const registerUseableAmmo = () => {
  const ammoConfig = getConfig().ammo;
  Inventory.registerUseable(Object.keys(ammoConfig), (src, item) => {
    Events.emitNet('weapons:client:useAmmo', src, item.id, ammoConfig[item.name].ammoType);
  });
};

export const getWeaponAmmo = (itemState: Inventory.ItemState) => {
  const weaponConfig = getWeaponConfig(itemState.name);
  if (!weaponConfig) return 0;

  if (weaponConfig.oneTimeUse) return 1;
  if (weaponConfig.unlimitedAmmo) return 9999;

  return Number(itemState.metadata.ammo ?? 1);
};

export const setWeaponAmmo = (plyId: number, itemState: Inventory.ItemState, amount: number) => {
  const ped = GetPlayerPed(String(plyId));
  const weaponHash = Util.getHash(itemState.name);
  SetPedAmmo(ped, weaponHash, amount);
  saveWeaponAmmo(plyId, itemState.id, amount);
};

export const saveWeaponAmmo = (plyId: number, itemId: string, amount: number) => {
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
