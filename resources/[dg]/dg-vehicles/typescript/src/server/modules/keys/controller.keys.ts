import { Auth, Events, Notifications, Sounds, Util } from '@dgx/server';
import { getVinForNetId } from '../../helpers/vehicle';
import { keyManager } from './classes/keymanager';
import { handleDoorSuccess, handleFail, handleHotwireSuccess, startVehicleLockpick } from './service.keys';
import { NO_LOCK_CLASSES } from './constants.keys';

on('doorlock:server:useLockpick', (src: number, itemId: string) => {
  startVehicleLockpick(src, itemId);
});

Events.onNet('vehicles:keys:finishLockPick', (src, type: string, id: string, isSuccess: boolean) => {
  if (!isSuccess) {
    handleFail(src, id);
    return;
  }

  switch (type) {
    case 'door': {
      handleDoorSuccess(src, id);
      break;
    }
    case 'hotwire': {
      handleHotwireSuccess(src, id);
      break;
    }
  }
});

Util.onPlayerLoaded(playerData => {
  const keys = keyManager.getAllPlayerKeys(playerData.source);
  Events.emitNet('vehicles:keys:initCache', playerData.source, keys);
});

global.exports('giveKeysToPlayer', (plyId: number, vehNetId: number) => {
  const vin = getVinForNetId(vehNetId);
  if (!vin) return;
  keyManager.addKey(vin, plyId);
});

Events.onNet('vehicles:keys:shareToPassengers', (src: number, netId: number, numSeats: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;
  if (!keyManager.hasKey(vin, src)) return;
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  for (let seat = -1; seat < numSeats - 1; seat++) {
    const ped = GetPedInVehicleSeat(vehicle, seat);
    const plyId = NetworkGetEntityOwner(ped);
    if (!plyId || plyId === src) continue;
    if (keyManager.hasKey(vin, plyId)) continue;
    keyManager.addKey(vin, plyId);
    Notifications.add(plyId, 'Je hebt de sleutels van dit voertuig ontvangen');
  }
});

Events.onNet('vehicles:keys:shareToClosest', (src: number, netId: number, numberOfSeats: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;
  if (!keyManager.hasKey(vin, src)) return;

  // If people in car give keys to them, else give to closest ply
  let targets: number[] = [];
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  const playersInVehicle = Util.getPlayersInVehicle(vehicle, numberOfSeats);
  if (playersInVehicle.length === 0) {
    const closestPlayer = Util.getClosestPlayer(src, 3.0);
    if (!closestPlayer) {
      Notifications.add(src, 'Er is niemand in de buurt', 'error');
      return;
    }
    targets.push(closestPlayer);
  } else {
    targets = playersInVehicle;
  }

  for (const target of targets) {
    if (keyManager.hasKey(vin, target)) return;
    keyManager.addKey(vin, target);
    Notifications.add(target, 'Je hebt de sleutels van dit voertuig ontvangen');
  }
});

Auth.onAuth(plyId => {
  Events.emitNet('vehicles:keys:setClassesWithoutLock', plyId, NO_LOCK_CLASSES.door);
});

Events.onNet('vehicles:keys:toggleLock', (plyId: number, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  // Sound are car_lock and car_unlock
  // 0 == unlocked for getter on server
  const vehLockStatus = GetVehicleDoorLockStatus(vehicle);
  const newLockStatus = vehLockStatus === 2 ? 0 : 2;
  const soundName = newLockStatus === 0 ? 'car_lock' : 'car_unlock';

  setImmediate(() => {
    SetVehicleDoorsLocked(vehicle, newLockStatus);
  });
  Sounds.playOnEntity(`vehicles_car_key_lock_${netId}`, soundName, 'DLC_NUTTY_SOUNDS', netId);

  setTimeout(() => {
    if (GetVehicleDoorLockStatus(vehicle) == newLockStatus) {
      const msg = newLockStatus === 0 ? 'Voertuig opengedaan' : 'Voertuig op slot gezet';
      Notifications.add(plyId, msg);
    } else {
      Notifications.add(plyId, 'Er is iets fout gelopen met het slotensysteem');
    }
  }, 500);
});
