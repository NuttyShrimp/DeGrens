import { Core, Events, Notifications, Sounds, Util, Vehicles } from '@dgx/server';
import { getVinForNetId } from '../../helpers/vehicle';
import { keyManager } from './classes/keymanager';
import {
  handleDoorSuccess,
  handleFail,
  handleHotwireSuccess,
  setVehicleCannotBeLockpicked,
  startVehicleLockpick,
} from './service.keys';

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

Core.onPlayerLoaded(playerData => {
  if (!playerData.serverId) return;
  const keys = keyManager.getAllPlayerKeys(playerData.serverId);
  Events.emitNet('vehicles:keys:initCache', playerData.serverId, keys);
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

Events.onNet('vehicles:keys:toggleLock', (plyId: number, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const locked = !Vehicles.getVehicleDoorsLocked(vehicle);
  const soundName = locked ? 'car_lock' : 'car_unlock';

  Vehicles.setVehicleDoorsLocked(vehicle, locked);
  Sounds.playOnEntity(`vehicles_car_key_lock_${netId}`, soundName, 'DLC_NUTTY_SOUNDS', netId);

  // timeout because setter needs to replicate before getter returns correct value
  setTimeout(() => {
    const lockStatus = GetVehicleDoorLockStatus(vehicle);
    if (lockStatus === (locked ? 2 : 0)) {
      Notifications.add(plyId, locked ? 'Voertuig op slot gezet' : 'Voertuig opengedaan');
    } else {
      Notifications.add(plyId, 'Er is iets fout gelopen met het slotensysteem');
    }
  }, 500);
});

global.exports('setVehicleCannotBeLockpicked', setVehicleCannotBeLockpicked);
