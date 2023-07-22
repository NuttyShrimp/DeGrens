import { BaseEvents, Events, RPC, UI } from '@dgx/client';
import { Util } from '@dgx/shared';
import { holsterWeapon, unholsterWeapon, forceRemoveWeapon } from './helpers.weapons';
import {
  getCurrentWeaponData,
  handleEnteredVehicle,
  handleLeftVehicle,
  isAnimationBusy,
  setCurrentWeaponData,
} from './service.weapons';

// Prevents weapon usage spamming
let isAwaitingAnim = false;

// Reenabling back items on restart wont work as thats a server call sadly
on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  RemoveAllPedWeapons(PlayerPedId(), true);
});

RPC.register('weapons:client:getCurrentWeaponId', () => {
  return getCurrentWeaponData()?.id ?? null;
});

Events.onNet('weapons:client:useWeapon', async (weaponData: Weapons.WeaponItem) => {
  // copy serialnumber of weapon on use
  const serialnumber = weaponData.metadata?.serialnumber;
  if (serialnumber) {
    UI.addToClipboard(serialnumber);
  }

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
global.exports('removeWeapon', forceRemoveWeapon);

BaseEvents.onEnteredVehicle(handleEnteredVehicle);
BaseEvents.onLeftVehicle(handleLeftVehicle);
