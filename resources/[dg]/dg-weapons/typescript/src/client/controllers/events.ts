import { Events, Inventory, Notifications, RPC, Taskbar, UI } from '@dgx/client';
import { AMMO_CONFIG } from '../constants';
import { getCurrentWeaponData, setCurrentWeaponData } from 'services/equipped';
import { forceRemoveWeapon, holsterWeapon, unholsterWeapon } from 'helpers/util';

on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  const currentWeaponData = getCurrentWeaponData();
  if (currentWeaponData) {
    Inventory.toggleObject(currentWeaponData.id, true);
  }
  RemoveAllPedWeapons(PlayerPedId(), true);
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

  const succesfulRemoval = Inventory.removeItemFromPlayer(itemName);
  if (!succesfulRemoval) {
    Notifications.add('Je hebt geen ammo opzak', 'error');
    return;
  }

  let amount = await RPC.execute<number>('weapons:server:getAmmo', currentWeaponData.hash, currentWeaponData.id);
  if (!amount) {
    console.log('Failed to get weapon ammo');
    return;
  }

  amount = Math.min(250, amount + ammoConfig.amount);
  SetPedAmmo(ped, equippedWeapon, amount);
  Events.emitNet('weapons:server:setAmmo', currentWeaponData.id, amount);
});

Events.onNet('weapons:client:removeWeapon', itemId => {
  forceRemoveWeapon(itemId, true);
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

Events.onNet('weapons:client:forceQuality', (quality: number) => {
  const currentWeaponData = getCurrentWeaponData();
  if (!currentWeaponData) {
    Notifications.add('Je hebt geen wapen vast', 'error');
    return;
  }
  Events.emitNet('weapons:server:forceQuality', currentWeaponData.id, quality);
});

Events.onNet('weapons:client:openAttachmentMenu', (menu: ContextMenu.Entry[]) => {
  UI.openApplication('contextmenu', menu);
});

Events.onNet('weapons:client:updateAttachments', (allComponents: string[], components: string[]) => {
  const weaponHash = getCurrentWeaponData()?.hash;
  if (!weaponHash) {
    Notifications.add('Je hebt geen wapen vast', 'error');
    return;
  }
  const ped = PlayerPedId();
  // first remove all then add the equipped ones
  allComponents.forEach(
    c => HasPedGotWeaponComponent(ped, weaponHash, c) && RemoveWeaponComponentFromPed(ped, weaponHash, c)
  );
  components.forEach(c => GiveWeaponComponentToPed(ped, weaponHash, c));
});
