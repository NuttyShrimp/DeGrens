import { Events, Notifications, PolyTarget, RPC, Util, Police } from '@dgx/client';
import locationManager from 'classes/LocationManager';

const safeZones: Partial<Record<Storerobbery.Id, Storerobbery.Data['safecoords']>> = {};
let isSafeHacker = false;

export const setSafeZones = (storeConfig: Storerobbery.Config['stores']) => {
  for (const [id, store] of Object.entries(storeConfig)) {
    safeZones[id as Storerobbery.Id] = store.safecoords;
  }
};

export const buildSafeZone = async (storeId: Storerobbery.Id) => {
  const coords = safeZones[storeId];
  if (!coords) {
    console.log('Failed to build safe zone');
    return;
  }

  PolyTarget.addCircleZone('store_safe', coords, 0.5, {
    data: {},
  });
};

export const destroySafeZone = () => {
  PolyTarget.removeZone('store_safe');
};

export const canInteractWithSafe = () => {
  if (!locationManager.currentStore === null) return false;
  return Police.enoughCopsForActivity('storerobbery_safe');
};

export const setIsSafeHacker = (val: boolean) => {
  isSafeHacker = val;
};

export const checkSafeState = async (storeId: Storerobbery.Id) => {
  if (!isSafeHacker) return;
  Events.emitNet('storerobbery:safes:cancelHack', storeId);
};

export const lootSafe = async () => {
  const canLoot = await RPC.execute<boolean>('storerobbery:safes:tryToLoot', locationManager.currentStore);
  if (!canLoot) {
    Notifications.add('Dit is nog niet open.', 'error');
    return;
  }

  const ped = PlayerPedId();
  await Util.loadAnimDict('amb@prop_human_bum_bin@idle_b');
  TaskPlayAnim(ped, 'amb@prop_human_bum_bin@idle_b', 'idle_d', 8.0, 8.0, -1, 50, 0, false, false, false);
  await Util.Delay(700);
  TaskPlayAnim(ped, 'amb@prop_human_bum_bin@idle_b', 'exit', 8.0, 8.0, -1, 50, 0, false, false, false);
};
