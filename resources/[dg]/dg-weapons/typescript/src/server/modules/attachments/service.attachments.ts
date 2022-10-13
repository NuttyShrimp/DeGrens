import { Events, Inventory, Notifications, RPC, Util } from '@dgx/server';
import { getWeaponItemState } from 'modules/weapons/service.weapons';
import { getConfig, getWeaponConfig } from 'services/config';
import { getAttachmentStashId } from './helpers.attachments';

export const registerUseableAttachments = () => {
  const items = getConfig().attachmentItems;
  Inventory.registerUseable(items, (src, itemState) => {
    addAttachment(src, itemState);
  });
};

const addAttachment = async (plyId: number, attachmentItem: Inventory.ItemState) => {
  const weaponId = await RPC.execute<string | null>('weapons:client:getCurrentWeaponId', plyId);
  if (!weaponId) {
    Notifications.add(plyId, 'Je hebt geen wapen vast', 'error');
    return;
  }

  const weaponItemState = getWeaponItemState(weaponId);
  if (!weaponItemState) return;

  const weaponConfig = getWeaponConfig(weaponItemState.name);
  if (!weaponConfig) return;

  const newComponent = weaponConfig.attachments?.[attachmentItem.name];
  if (!newComponent) {
    Notifications.add(plyId, 'Dit past niet op je wapen', 'error');
    return;
  }

  const stashId = getAttachmentStashId(weaponItemState);
  const components = await getEquippedComponents(weaponItemState.name, stashId);

  if (components.includes(newComponent)) {
    Notifications.add(plyId, 'Dit zit al op je wapen', 'error');
    return;
  }

  await Inventory.moveItemToInventory('stash', stashId, attachmentItem.id);
  Events.emitNet('weapons:client:updateAttachments', plyId, Object.values(weaponConfig.attachments ?? {}), [
    ...components,
    newComponent,
  ]);
  Util.Log(
    'weapons:attachment:add',
    {
      weaponName: weaponItemState.name,
      weaponId: weaponItemState.id,
      attachmentName: attachmentItem.name,
      attachmentId: attachmentItem.id,
    },
    `A ${attachmentItem.name} has been added to weaponitem ${weaponItemState.id}`,
    plyId
  );
};

export const getEquippedComponents = async (weaponName: string, stashId: string) => {
  const weaponConfig = getWeaponConfig(weaponName);
  if (weaponConfig?.attachments === undefined) return [];

  const equippedAttachmentsItem = await Inventory.getItemsInInventory('stash', stashId);
  return equippedAttachmentsItem.reduce<string[]>((all, item) => {
    all.push(weaponConfig.attachments![item.name]);
    return all;
  }, []);
};
