import { Events, Notifications, Taskbar, RPC, Inventory } from '@dgx/client';
import { getCurrentWeaponData } from 'modules/weapons/service.weapons';
import { AMMO_CONFIG } from '../../constants';

Events.onNet('weapons:client:useAmmo', async (itemName: string) => {
  if (getCurrentWeaponData() === null) {
    Notifications.add('Je hebt geen wapen vast', 'error');
    return;
  }

  const ammoConfig = AMMO_CONFIG[itemName];
  if (!ammoConfig) {
    Notifications.add('Dit is geen ammo', 'error');
    return;
  }

  const ped = PlayerPedId();
  const equippedWeapon = GetSelectedPedWeapon(ped);
  const ammoType = GetPedAmmoTypeFromWeapon_2(ped, equippedWeapon); // _2 version always gives base type
  if (ammoType !== GetHashKey(ammoConfig.ammoType)) {
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

  const succesfulRemoval = await Inventory.removeItemFromPlayer(itemName);
  if (!succesfulRemoval) {
    Notifications.add('Je hebt geen ammo opzak', 'error');
    return;
  }

  let amount = await RPC.execute<number>('weapons:server:getAmmo', currentWeaponData.id);
  if (!amount) {
    console.log('Failed to get weapon ammo');
    return;
  }

  amount = Math.min(250, amount + ammoConfig.amount);
  SetPedAmmo(ped, equippedWeapon, amount);
  Events.emitNet('weapons:server:setAmmo', currentWeaponData.id, amount);
});

Events.onNet('weapons:client:forceAmmo', (amount: number) => {
  const currentWeaponData = getCurrentWeaponData();
  if (!currentWeaponData) {
    Notifications.add('Je hebt geen wapen vast', 'error');
    return;
  }

  amount = Math.min(amount, 250);
  SetPedAmmo(PlayerPedId(), currentWeaponData.hash, amount);
  Events.emitNet('weapons:server:setAmmo', currentWeaponData.id, amount);
});
