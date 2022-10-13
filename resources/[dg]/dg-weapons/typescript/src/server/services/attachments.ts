import { Events, Inventory, Notifications, Util } from '@dgx/server';
import { getAttachmentStashId, getEquippedComponents } from 'helpers/util';
import { mainLogger } from 'sv_logger';
import { WEAPONS } from '../contants';

export const addAttachment = async (
  plyId: number,
  weaponData: Weapons.WeaponItem,
  attachmentItem: Inventory.ItemState
) => {
  const weaponConfig = WEAPONS[GetHashKey(weaponData.name)];
  if (!weaponConfig) {
    mainLogger.error(`Could not find weapon config of ${weaponData.name} to add attachment`);
    Util.Log(
      'weapons:noConfig',
      { weaponData, attachmentItem },
      `Could not find weapon config of ${weaponData.name} to add attachment`,
      undefined,
      true
    );
    return;
  }

  const newComponent = weaponConfig.attachments?.[attachmentItem.name];
  if (!newComponent) {
    Notifications.add(plyId, 'Dit past niet op je wapen', 'error');
    return;
  }

  const stashId = getAttachmentStashId(weaponData);
  const components = await getEquippedComponents(weaponData.hash, stashId);

  if (components.includes(newComponent)) {
    Notifications.add(plyId, 'Dit zit al op je wapen', 'error');
    return;
  }

  Inventory.moveItemToInventory('stash', stashId, attachmentItem.id);
  Events.emitNet('weapons:client:updateAttachments', plyId, weaponConfig.attachments, [...components, newComponent]);
};

Events.onNet('weapons:server:removeAttachment', async (src: number, weaponItemId: string, attachmentName: string) => {
  const weaponItemState = Inventory.getItemStateById(weaponItemId);
  if (!weaponItemState) {
    mainLogger.error(`Could not find weaponitem (${weaponItemId}) to remove attachment`);
    Util.Log(
      'weapons:couldNotFindItem',
      { weaponItemId, attachmentName },
      `${Util.getName(src)} tried to remove attachment but the weapon item was not found`,
      src,
      true
    );
    return;
  }

  const weaponConfig = WEAPONS[GetHashKey(weaponItemState.name)];
  if (!weaponConfig) {
    mainLogger.error(`Could not find weapon config of ${weaponItemState.name} to add attachment`);
    Util.Log(
      'weapons:noConfig',
      { weaponItemState },
      `Could not find weapon config of ${weaponItemState.name} to add attachment`,
      src,
      true
    );
    return;
  }

  const stashId = getAttachmentStashId(weaponItemState);
  const attachmentItem = await Inventory.getFirstItemOfName('stash', stashId, attachmentName);
  if (!attachmentItem) {
    return;
  }
  const cid = Util.getCID(src);
  Inventory.moveItemToInventory('player', String(cid), attachmentItem?.id);

  const components = await getEquippedComponents(GetHashKey(weaponItemState.name), stashId);
  Events.emitNet('weapons:client:updateAttachments', src, weaponConfig.attachments, components);
});
