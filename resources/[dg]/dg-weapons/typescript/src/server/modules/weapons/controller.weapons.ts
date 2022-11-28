import { Events, Inventory, Notifications, RPC, Util } from '@dgx/server';
import { setWeaponAmmo } from 'modules/ammo/service.ammo';
import { getWeaponConfig } from 'services/config';
import { getWeaponItemState, setEquippedWeapon, setWeaponQuality } from './service.weapons';

Events.onNet(
  'weapons:server:stoppedShooting',
  (src: number, itemId: string, ammoCount: number, qualityDecrease: number) => {
    const itemState = getWeaponItemState(itemId);
    if (!itemState) return;

    const weaponConfig = getWeaponConfig(itemState.name);
    if (!weaponConfig) return;

    if (weaponConfig.oneTimeUse) {
      Inventory.destroyItem(itemId);
      return;
    }

    setWeaponQuality(itemId, itemState.quality - weaponConfig.durabilityMultiplier * qualityDecrease);
    setWeaponAmmo(itemId, ammoCount);
  }
);

Events.onNet('weapons:server:removeWeapon', src => {
  setEquippedWeapon(src, GetHashKey('WEAPON_UNARMED'));
});

Inventory.onInventoryUpdate(
  'player',
  (identifier, _, itemState) => {
    const weaponConfig = getWeaponConfig(itemState.name, true);
    if (!weaponConfig) return;
    if (weaponConfig.oneTimeUse) return;

    const targetId = DGCore.Functions.GetPlayerByCitizenId(Number(identifier))?.PlayerData?.source;
    if (!targetId) return;
    Events.emitNet('weapons:client:removeWeapon', targetId, itemState.id);
  },
  undefined,
  'remove'
);

global.exports('forceSetQuality', async (plyId: number, quality: number) => {
  const weaponId = await RPC.execute<string | null>('weapons:client:getCurrentWeaponId', plyId);
  if (!weaponId) {
    Notifications.add(plyId, 'Je hebt geen wapen vast', 'error');
    return;
  }
  setWeaponQuality(weaponId, quality);
  Util.Log(
    'weapons:forceSetQuality',
    { itemId: weaponId, quality },
    `Quality of weaponitem ${weaponId} has been force set to ${quality}`
  );
});

global.exports('getPlayerEquippedWeapon', (plyId: number) => {});
