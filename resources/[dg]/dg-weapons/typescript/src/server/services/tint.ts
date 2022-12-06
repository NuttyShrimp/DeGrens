import { Events, Inventory, Util } from '@dgx/server';

Events.onNet('weapons:server:saveTint', (src: number, itemId: string, tint: string) => {
  Inventory.setMetadataOfItem(itemId, metadata => ({ ...metadata, tint }));
  applyWeaponTint(src, tint);
  Util.Log('weapons:changedTint', { itemId, tint }, `Tint ${tint} has been applied to weaponitem ${itemId}`);
});

export const applyWeaponTint = (plyId: number, tintName: string) => {
  Events.emitNet('weapons:server:applyTint', plyId, tintName);
};
