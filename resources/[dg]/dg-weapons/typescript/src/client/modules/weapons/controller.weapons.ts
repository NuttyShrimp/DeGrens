import { Events, Inventory, RPC } from '@dgx/client';
import { Util } from '@dgx/shared';
import { holsterWeapon, unholsterWeapon, forceRemoveWeapon, showReticle } from './helpers.weapons';
import { getCurrentWeaponData, isAnimationBusy, setCurrentWeaponData } from './service.weapons';

// Prevents weapon usage spamming
let isAwaitingAnim = false;

on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  const currentWeaponData = getCurrentWeaponData();
  if (currentWeaponData) {
    Inventory.toggleObject(currentWeaponData.id, true);
  }
  RemoveAllPedWeapons(PlayerPedId(), true);
});

RPC.register('weapons:client:getCurrentWeaponId', () => {
  return getCurrentWeaponData()?.id ?? null;
});

Events.onNet('weapons:client:useWeapon', async (weaponData: Weapons.WeaponItem) => {
  if (isAwaitingAnim) return;

  if (isAnimationBusy()) {
    isAwaitingAnim = true;
    await Util.awaitCondition(() => !isAnimationBusy());
    isAwaitingAnim = false;
  }

  const previousWeaponData = getCurrentWeaponData();
  if (previousWeaponData !== null) {
    const lastWeaponItemId = previousWeaponData.id;
    await holsterWeapon(previousWeaponData);
    setCurrentWeaponData(null);
    if (lastWeaponItemId === weaponData.id) return;
  }

  await unholsterWeapon(weaponData);
  setCurrentWeaponData(weaponData);
});

Events.onNet('weapons:client:removeWeapon', itemId => {
  forceRemoveWeapon(itemId, true);
});

global.exports('getCurrentWeaponData', getCurrentWeaponData);
global.exports('showReticle', showReticle);
global.exports('removeWeapon', forceRemoveWeapon);
