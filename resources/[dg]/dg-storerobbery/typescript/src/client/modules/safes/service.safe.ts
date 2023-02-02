import { Events, Notifications, PolyTarget, RPC, Util, Inventory, Minigames, Police } from '@dgx/client';
import locationManager from 'classes/LocationManager';

const safeZones: Partial<Record<Storerobbery.Id, Storerobbery.Data['safecoords']>> = {};

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

export const checkSafeState = async (storeId: Storerobbery.Id) => {
  const isSafeHacker = await RPC.execute<boolean>('storerobbery:server:isSafeHacker', storeId);
  if (!isSafeHacker) return;

  Notifications.add('Verbinding verbroken...', 'error');
  Events.emitNet('storerobbery:server:cancelHack', storeId);
};

export const hackSafe = async () => {
  const safeState = await RPC.execute<Storerobbery.SafeState>(
    'storerobbery:server:getSafeState',
    locationManager.currentStore
  );
  if (safeState !== 'closed') {
    Notifications.add('Je moet dit niet meer ontcijferen.', 'error');
    return;
  }

  const hasItem = await Inventory.doesPlayerHaveItems('decoding_tool');
  if (!hasItem) {
    Notifications.add('Hoe ga je dit openen?', 'error');
    return;
  }

  Events.emitNet('storerobbery:server:startJob', locationManager.currentStore, 'safe');
  const gameSuccess = await Minigames.sequencegame(4, 5, 10);
  const removedItem = await Inventory.removeItemFromPlayer('decoding_tool');
  if (!removedItem) return;

  if (gameSuccess) {
    Events.emitNet('storerobbery:server:hackSafe', locationManager.currentStore);
    global.exports['dg-phone'].sendMail(
      'Decodering Kluis',
      'Hackerman',
      'Het decoderen van de kluis zal even duren. <br><br>Geef me 5 minuten. <br><br>Ga niet uit de winkel of de verbinding zal verbreken!'
    );
  } else {
    Notifications.add('Mislukt...', 'error');
  }
};

export const lootSafe = async () => {
  const safeState = await RPC.execute<Storerobbery.SafeState>(
    'storerobbery:server:getSafeState',
    locationManager.currentStore
  );
  if (safeState !== 'opened') {
    Notifications.add('Dit is nog niet open.', 'error');
    return;
  }

  Events.emitNet('storerobbery:server:lootSafe', locationManager.currentStore);
  const ped = PlayerPedId();
  await Util.loadAnimDict('amb@prop_human_bum_bin@idle_b');
  TaskPlayAnim(ped, 'amb@prop_human_bum_bin@idle_b', 'idle_d', 8.0, 8.0, -1, 50, 0, false, false, false);
  await Util.Delay(700);
  TaskPlayAnim(ped, 'amb@prop_human_bum_bin@idle_b', 'exit', 8.0, 8.0, -1, 50, 0, false, false, false);
};
