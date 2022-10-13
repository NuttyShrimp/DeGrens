import { Chat, Events, Inventory, Notifications, RPC, Util } from '@dgx/server';
import { WEAPONS } from 'contants';
import {
  getAmmoInWeaponItem,
  getAttachmentNameFromComponent,
  getAttachmentStashId,
  getEquippedComponents,
} from 'helpers/util';
import { getConfig } from 'services/config';
import { mainLogger } from 'sv_logger';

Chat.registerCommand('attachments', 'Beheer de attachments op je wapen', [], 'user', async src => {
  const weaponData = await RPC.execute<Weapons.WeaponItem | null>('weapons:client:getWeaponData', src);
  if (!weaponData) {
    Notifications.add(src, 'Je hebt geen wapen vast', 'error');
    return;
  }

  const stashId = getAttachmentStashId(weaponData);
  const components = await getEquippedComponents(weaponData.hash, stashId);
  const menu: ContextMenu.Entry[] = [
    {
      title: 'Attachments',
      description: 'Selecteer een attachment om deze te verwijderen.',
    },
    ...components.map(comp => {
      const attachmentName = getAttachmentNameFromComponent(weaponData.hash, comp);
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

RPC.register('weapons:server:getAmmoConfig', src => {
  return getConfig().ammo;
});

RPC.register('weapons:server:getAmmo', (src, itemId: string) => {
  return getAmmoInWeaponItem(itemId);
});

RPC.register('weapons:server:getWeaponAttachments', async (src, itemId: string) => {
  const itemState = Inventory.getItemStateById(itemId);
  if (!itemState) {
    mainLogger.error(`Could not find weaponitem (${itemId}) to get attachments`);
    Util.Log(
      'weapons:couldNotFindItem',
      { itemId },
      `${Util.getName(src)} tried to get attachments for item that does not exist`,
      src,
      true
    );
    return;
  }
  const stashId = getAttachmentStashId(itemState);
  return await getEquippedComponents(GetHashKey(itemState.name), stashId);
});

Events.onNet('weapons:server:setAmmo', (src: number, itemId: string, amount: number) => {
  Inventory.setMetadataOfItem(itemId, metadata => ({
    ...metadata,
    ammo: amount,
  }));
});

Events.onNet(
  'weapons:server:stoppedShooting',
  (src: number, itemId: string, ammoCount: number, qualityDecrease: number) => {
    const itemState = Inventory.getItemStateById(itemId);
    if (!itemState) {
      mainLogger.error(`Could not find weaponitem (${itemId}) that was used to shoot`);
      Util.Log(
        'weapons:couldNotFindItem',
        { itemId, ammoCount, qualityDecrease },
        `${Util.getName(src)} stopped shooting a weapon but the weapon item was not found`,
        src,
        true
      );
      return;
    }

    const weaponConfig = WEAPONS[GetHashKey(itemState.name)];
    if (!weaponConfig) {
      mainLogger.error(`Could not find weapon config of ${itemState.name}`);
      Util.Log(
        'weapons:noConfig',
        { itemState, ammoCount, qualityDecrease },
        `${Util.getName(src)} stopped shooting a weapon but could not find weaponconfig`,
        src,
        true
      );
      return;
    }

    if (weaponConfig.oneTimeUse) {
      Inventory.destroyItem(itemId);
      return;
    }

    Inventory.setQualityOfItem(itemId, oldQuality => {
      return oldQuality - weaponConfig.durabilityMultiplier * qualityDecrease;
    });
    Inventory.setMetadataOfItem(itemId, metadata => ({
      ...metadata,
      ammo: ammoCount,
    }));
  }
);

Events.onNet('weapons:server:setTint', (src: number, itemId: string, tint: number) => {
  Inventory.setMetadataOfItem(itemId, metadata => ({ ...metadata, tint }));
});

Events.onNet('weapons:server:forceQuality', (src: number, itemId: string, quality: number) => {
  Inventory.setQualityOfItem(itemId, () => quality);
});

Inventory.onInventoryUpdate(
  'player',
  (identifier, _, itemState) => {
    const weaponConfig = WEAPONS[GetHashKey(itemState.name)];
    if (!weaponConfig) return;
    if (weaponConfig.oneTimeUse) return;

    const targetId = DGCore.Functions.GetPlayerByCitizenId(Number(identifier))?.PlayerData?.source;
    if (!targetId) return;
    Events.emitNet('weapons:client:removeWeapon', targetId, itemState.id);
  },
  undefined,
  'remove'
);
