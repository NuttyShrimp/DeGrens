import { Events, Notifications, Taskbar } from '@dgx/client';
import { getCurrentWeaponData } from 'modules/weapons/service.weapons';

Events.onNet('weapons:client:useAmmo', async (ammoItemId: string, ammoType: string) => {
  if (getCurrentWeaponData() === null) {
    Notifications.add('Je hebt geen wapen vast', 'error');
    return;
  }

  const ped = PlayerPedId();
  const equippedWeapon = GetSelectedPedWeapon(ped);
  const requiredAmmoType = GetPedAmmoTypeFromWeapon_2(ped, equippedWeapon); // _2 version always gives base type
  if (requiredAmmoType !== GetHashKey(ammoType)) {
    Notifications.add('Dit past niet in je wapen', 'error');
    return;
  }

  const ammoInWeapon = Number(GetAmmoInPedWeapon(ped, equippedWeapon));
  if (ammoInWeapon >= 250) {
    Notifications.add('Je wapen zit al vol', 'error');
    return;
  }

  const [wasCancelled] = await Taskbar.create('gun', 'Wapen laden', 7000, {
    canCancel: true,
    disableInventory: true,
    cancelOnDeath: true,
    disablePeek: true,
    controlDisables: {
      combat: true,
    },
  });
  if (wasCancelled) return;

  const currentWeaponData = getCurrentWeaponData();
  if (currentWeaponData === null) {
    Notifications.add('Je hebt geen wapen vast', 'error');
    return;
  }

  Events.emitNet('weapons:server:finishAmmoUsage', currentWeaponData.id, ammoItemId);
});
