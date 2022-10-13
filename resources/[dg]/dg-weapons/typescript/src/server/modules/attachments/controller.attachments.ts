import { Chat, Events, Notifications, RPC, Util, Inventory } from '@dgx/server';
import { getWeaponItemState } from 'modules/weapons/service.weapons';
import { getWeaponConfig } from 'services/config';
import { getAttachmentStashId, getAttachmentNameFromComponent } from './helpers.attachments';
import { getEquippedComponents } from './service.attachments';

Chat.registerCommand('attachments', 'Beheer de attachments op je wapen', [], 'user', async src => {
  const weaponId = await RPC.execute<string | null>('weapons:client:getCurrentWeaponId', src);
  if (!weaponId) {
    Notifications.add(src, 'Je hebt geen wapen vast', 'error');
    return;
  }

  const weaponItemState = getWeaponItemState(weaponId);
  if (!weaponItemState) return;

  const stashId = getAttachmentStashId(weaponItemState);
  const components = await getEquippedComponents(weaponItemState.name, stashId);

  const menu: ContextMenu.Entry[] = [
    {
      title: 'Attachments',
      description: 'Selecteer een attachment om deze te verwijderen.',
    },
    ...components.map(comp => {
      const attachmentName = getAttachmentNameFromComponent(weaponItemState.name, comp);
      const title = attachmentName !== undefined ? Inventory.getItemData(attachmentName)?.label : undefined;
      return {
        title: title ?? 'Unknown Item',
        icon: 'trash',
        callbackURL: 'weapons/removeAttachment',
        data: {
          name: attachmentName,
        },
      };
    }),
  ];

  Events.emitNet('weapons:client:openAttachmentMenu', src, menu);
});

RPC.register('weapons:server:getWeaponAttachments', async (src, weaponItemId: string) => {
  const weaponItemState = getWeaponItemState(weaponItemId);
  if (!weaponItemState) return;

  const stashId = getAttachmentStashId(weaponItemState);
  const components = await getEquippedComponents(weaponItemState.name, stashId);
  return components;
});

Events.onNet('weapons:server:removeAttachment', async (src: number, weaponItemId: string, attachmentName: string) => {
  const weaponItemState = getWeaponItemState(weaponItemId);
  if (!weaponItemState) return;

  const weaponConfig = getWeaponConfig(weaponItemState.name);
  if (!weaponConfig) return;

  const stashId = getAttachmentStashId(weaponItemState);
  const attachmentItem = await Inventory.getFirstItemOfName('stash', stashId, attachmentName);
  if (!attachmentItem) return;
  const cid = Util.getCID(src);
  await Inventory.moveItemToInventory('player', String(cid), attachmentItem?.id);

  const components = await getEquippedComponents(weaponItemState.name, stashId);
  Events.emitNet('weapons:client:updateAttachments', src, Object.values(weaponConfig.attachments ?? {}), components);
  Util.Log(
    'weapons:attachment:remove',
    {
      weaponName: weaponItemState.name,
      weaponId: weaponItemState.id,
      attachmentName: attachmentItem.name,
      attachmentId: attachmentItem.id,
    },
    `A ${attachmentItem.name} has been removed from weaponitem ${weaponItemState.id}`,
    src
  );
});
