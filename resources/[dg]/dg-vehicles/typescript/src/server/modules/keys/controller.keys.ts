import { Events, Notifications, RPC, Util } from '@dgx/server';

import { getVinForNetId } from '../../helpers/vehicle';

import { keyManager } from './classes/keymanager';
import { handleDoorSuccess, handleFail, handleHotwireSuccess, startVehicleLockpick } from './service.keys';

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

RPC.register('vehicles:keys:getAll', (src: number) => {
  return keyManager.getAllPlayerKeys(src);
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

Events.onNet('vehicles:keys:shareToClosest', (src: number, netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;
  if (!keyManager.hasKey(vin, src)) return;

  let target: number;
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  const driver = GetPedInVehicleSeat(vehicle, -1);
  if (!driver) {
    const closestPlayer = Util.getClosestPlayer(src, 3.0);
    if (!closestPlayer) {
      Notifications.add(src, 'Er is niemand in de buurt', 'error');
      return;
    }
    target = closestPlayer;
  } else {
    const driverPlyId = NetworkGetEntityOwner(driver);
    if (!driverPlyId) {
      Notifications.add(src, 'Kon bestuurder niet vinden', 'error');
      return;
    }
    target = driverPlyId;
  }
  if (keyManager.hasKey(vin, target)) return;
  keyManager.addKey(vin, target);
  Notifications.add(target, 'Je hebt de sleutels van dit voertuig ontvangen');
});
