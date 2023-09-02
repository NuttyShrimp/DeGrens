import { Core, Events, Inventory, Jobs, Notifications, Util, Vehicles } from '@dgx/server';
import boostManager from 'classes/boostmanager';
import contractManager from 'classes/contractmanager';
import { appendFile } from 'fs/promises';

Core.onPlayerLoaded(playerData => {
  if (!playerData.serverId) return;
  boostManager.handlePlayerJoined(playerData.serverId, playerData.citizenid);
});

Core.onPlayerUnloaded((plyId, cid) => {
  contractManager.handleCharacterUnloaded(plyId);
  boostManager.handlePlayerLeft(plyId, cid);
});

Jobs.onGroupLeave((plyId, _, groupId) => {
  boostManager.handlePlayerLeftGroup(plyId, groupId);
});

Events.onNet('carboosting:dev:saveLocation', (_, location: Carboosting.LocationConfig) => {
  appendFile('carboosting_locations.json', JSON.stringify(location, undefined, 2) + ',\n', 'utf8');
});

Vehicles.onLockpick((plyId, vehicle) => {
  boostManager.handleVehicleLockpick(plyId, vehicle);
});

Inventory.registerUseable('tracker_disabler', plyId => {
  const ped = GetPlayerPed(String(plyId));
  const vehicle = GetVehiclePedIsIn(ped, false);
  if (!vehicle || !DoesEntityExist(vehicle)) {
    Notifications.add(plyId, 'Je zit niet in een voertuig', 'error');
    return;
  }
  if (!GetIsVehicleEngineRunning(vehicle)) {
    Notifications.add(plyId, 'Je kan dit alleen wanneer de motor aanstaat', 'error');
    return;
  }
  const driverPed = GetPedInVehicleSeat(vehicle, -1);
  if (!driverPed || !DoesEntityExist(driverPed) || !IsPedAPlayer(driverPed)) {
    Notifications.add(plyId, 'Er zit niemand aan het stuur', 'error');
    return;
  }
  if (!Util.isDevEnv() && ped === driverPed) {
    Notifications.add(plyId, 'Je kan dit niet als bestuurder', 'error');
    return;
  }
  boostManager.handleTrackerDisablerUsage(plyId, vehicle);
});

// finish all boosts if server restarting, we do this to update reputations
on('txAdmin:events:serverShuttingDown', (evtData: { delay: number }) => {
  if (evtData.delay < 5000) return; // 5000 is delay when restarting because of scheduled restart
  boostManager.finishAllBoosts();
});
