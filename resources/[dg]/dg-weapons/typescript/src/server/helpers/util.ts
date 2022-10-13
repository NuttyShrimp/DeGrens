import { Inventory, Util } from '@dgx/server';
import { WEAPONS } from 'contants';
import { mainLogger } from 'sv_logger';

export const getAmmoInWeaponItem = (itemId: string) => {
  const itemState = Inventory.getItemStateById(itemId);
  if (!itemState) {
    mainLogger.error(`Could not find weaponitem (${itemId}) to get ammocount`);
    Util.Log('weapons:couldNotFindItem', { itemId }, `Failed to get weaponitem to get ammo of`, undefined, true);
    return 0;
  }

  const weaponHash = GetHashKey(itemState.name);
  const weaponConfig = WEAPONS[weaponHash];
  if (!weaponConfig) {
    mainLogger.error(`Could not find weapon config of ${itemState.name}`);
    Util.Log('weapons:noConfig', { itemState }, `Could not get weapon config for weapon`, undefined, true);
    return 0;
  }

  let amount = 0;
  if (weaponConfig.oneTimeUse) {
    amount = 1;
  } else if (weaponConfig.unlimitedAmmo) {
    amount = 9999;
  } else {
    amount = Number(itemState.metadata.ammo ?? 1);
  }
  return amount;
};

export const getAttachmentNameFromComponent = (weaponHash: number, component: string) => {
  const possibleAttachments = WEAPONS[weaponHash].attachments;
  if (!possibleAttachments) return;
  for (const [attachment, comp] of Object.entries(possibleAttachments)) {
    if (component !== comp) continue;
    return attachment;
  }
};

export const getEquippedComponents = async (weaponHash: number, stashId: string) => {
  const possibleAttachments = WEAPONS[weaponHash].attachments;
  if (!possibleAttachments) return [];
  const equippedAttachmentsItem = await Inventory.getItemsInInventory('stash', stashId);
  return equippedAttachmentsItem.reduce<string[]>((all, item) => {
    all.push(possibleAttachments[item.name]);
    return all;
  }, []);
};

export const getAttachmentStashId = (itemState: Inventory.ItemState) => {
  return `weapon_${itemState.metadata?.serialnumber}`;
};
