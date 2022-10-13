import { Events, Inventory, Util } from '@dgx/server';

export const setWeaponTint = (itemId: string, tint: string) => {
  Inventory.setMetadataOfItem(itemId, metadata => ({ ...metadata, tint }));
  Util.Log('weapons:changedTint', { itemId, tint }, `Tint ${tint} has been applied to weaponitem ${itemId}`);
};

Events.onNet('weapons:server:setTint', (src: number, itemId: string, tintName: string) => {
  setWeaponTint(itemId, tintName);
});
