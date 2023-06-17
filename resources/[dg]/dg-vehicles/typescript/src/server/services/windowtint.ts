import { Inventory, Events, Notifications, Util } from '@dgx/server';
import { getCurrentVehicle, getVinForVeh } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { saveCosmeticUpgrades } from 'modules/upgrades/service.upgrades';

Inventory.registerUseable('window_tint', async plyId => {
  const vehicle = getCurrentVehicle(plyId, true);
  if (!vehicle) {
    Notifications.add(plyId, 'Je moet als bestuurder in een voertuig zitten hiervoor', 'error');
    return;
  }

  const vin = getVinForVeh(vehicle);
  if (!vin || !vinManager.isVinFromPlayerVeh(vin)) {
    Notifications.add(plyId, 'Dit voertuig is niet van een burger', 'error');
    return;
  }

  Events.emitNet('vehicles:windowtint:openMenu', plyId);
});

Events.onNet('vehicles:windowtint:save', async (plyId, tint: number) => {
  const vehicle = getCurrentVehicle(plyId, true);
  if (!vehicle) {
    Notifications.add(plyId, 'Je moet als bestuurder in een voertuig zitten hiervoor', 'error');
    return;
  }

  const vin = getVinForVeh(vehicle);
  if (!vin) return;

  const removed = await Inventory.removeItemByNameFromPlayer(plyId, 'window_tint');
  if (!removed) {
    Notifications.add(plyId, 'Je hebt geen folie...', 'error');
    return;
  }

  saveCosmeticUpgrades(vin, { windowTint: tint });

  Util.Log(
    'vehicles:windowtint:change',
    {
      vin,
      tint,
    },
    `${Util.getName(plyId)}(${plyId}) has changed windowtint of vehicle ${vin}`
  );
});
