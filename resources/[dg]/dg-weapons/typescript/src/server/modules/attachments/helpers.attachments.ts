import { getWeaponConfig } from 'services/config';

export const getAttachmentNameFromComponent = (weaponName: string, component: string) => {
  const weaponConfig = getWeaponConfig(weaponName);
  if (weaponConfig?.attachments === undefined) return;

  for (const [attachment, comp] of Object.entries(weaponConfig.attachments)) {
    if (component !== comp) continue;
    return attachment;
  }
};

export const getAttachmentStashId = (itemState: Inventory.ItemState<Weapons.WeaponItemMetadata>) => {
  return `weapon_${itemState.metadata?.serialnumber}`;
};
