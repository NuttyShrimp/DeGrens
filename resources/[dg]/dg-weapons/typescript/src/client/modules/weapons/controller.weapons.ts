import { Events, Inventory, RPC } from '@dgx/client';
import { holsterWeapon, unholsterWeapon, forceRemoveWeapon, showReticle } from './helpers.weapons';
import { getCurrentWeaponData, setCurrentWeaponData } from './service.weapons';

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

Events.onNet('weapons:client:useWeapon', async (weaponData: Weapons.WeaponItem, ammoCount: number) => {
  const ped = PlayerPedId();
  RemoveAllPedWeapons(ped, true);

  const previousWeaponData = getCurrentWeaponData();
  if (previousWeaponData !== null) {
    const lastWeaponItemId = previousWeaponData.id;
    holsterWeapon(previousWeaponData);
    setCurrentWeaponData(null);
    if (lastWeaponItemId === weaponData.id) return;
  }

  GiveWeaponToPed(ped, weaponData.hash, ammoCount, false, false);
  unholsterWeapon(weaponData);
  setCurrentWeaponData(weaponData);
});

Events.onNet('weapons:client:removeWeapon', itemId => {
  forceRemoveWeapon(itemId, true);
});

global.exports('getCurrentWeaponData', getCurrentWeaponData);
global.exports('showReticle', showReticle);
global.exports('removeWeapon', forceRemoveWeapon);
