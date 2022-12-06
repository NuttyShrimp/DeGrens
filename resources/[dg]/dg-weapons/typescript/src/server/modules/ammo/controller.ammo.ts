import { Events, Inventory, Notifications, RPC } from '@dgx/server';
import { getWeaponItemState } from 'modules/weapons/service.weapons';
import { getConfig } from 'services/config';
import { getWeaponAmmo, setWeaponAmmo } from './service.ammo';

Events.onNet('weapons:server:finishAmmoUsage', async (src: number, weaponItemId: string, ammoItemId: string) => {
  const weaponItemState = getWeaponItemState(weaponItemId);
  if (!weaponItemState) return;

  const ammoItemState = Inventory.getItemStateById(ammoItemId);
  if (!ammoItemState) return;
  const succesfulRemoval = await Inventory.removeItemByIdFromPlayer(src, ammoItemId);
  if (!succesfulRemoval) {
    Notifications.add(src, 'Je hebt geen ammo opzak', 'error');
    return;
  }

  const currentAmmo = getWeaponAmmo(weaponItemState);
  const increase = getConfig().ammo[ammoItemState.name].amount;
  const newAmount = Math.min(250, currentAmmo + increase);

  setWeaponAmmo(src, weaponItemState, newAmount);
});

global.exports('forceSetAmmo', async (plyId: number, amount: number) => {
  const weaponId = await RPC.execute<string | null>('weapons:client:getCurrentWeaponId', plyId);
  if (!weaponId) {
    Notifications.add(plyId, 'Je hebt geen wapen vast', 'error');
    return;
  }
  const itemState = getWeaponItemState(weaponId);
  if (!itemState) return;

  setWeaponAmmo(plyId, itemState, amount);
});
