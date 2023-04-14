import { Events, Inventory, Util } from '@dgx/server';

Events.onNet('weapons:server:saveTint', (src: number, itemId: string, weaponHash: number, tint: string) => {
  Inventory.setMetadataOfItem(itemId, metadata => ({ ...metadata, tint }));
  applyWeaponTint(src, weaponHash, tint);
  Util.Log('weapons:changedTint', { itemId, tint }, `Tint ${tint} has been applied to weaponitem ${itemId}`);
});

export const applyWeaponTint = (plyId: number, weaponHash: number, tintName: string) => {
  Events.emitNet('weapons:server:applyTint', plyId, weaponHash, tintName);
};
