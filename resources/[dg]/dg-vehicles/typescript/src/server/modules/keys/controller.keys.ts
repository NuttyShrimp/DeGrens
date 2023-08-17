import { Core, Events, Inventory, Jobs, Notifications, Sounds, Util, Vehicles } from '@dgx/server';
import { getVinForNetId, getVinForVeh } from '../../helpers/vehicle';
import { keyManager } from './classes/keymanager';
import {
  getVehicleDoorsLocked,
  handleLockpickFinish,
  setVehicleCannotBeLockpicked,
  setVehicleDoorsLocked,
  handleLockpickStart,
  skipDispatchOnLockpickForVin,
} from './service.keys';

Core.onPlayerLoaded(playerData => {
  if (!playerData.serverId) return;
  const keys = keyManager.getAllPlayerKeys(playerData.serverId);
  Events.emitNet('vehicles:keys:initCache', playerData.serverId, keys);
});

global.exports('getVehicleDoorsLocked', getVehicleDoorsLocked);
global.exports('setVehicleDoorsLocked', setVehicleDoorsLocked);

global.exports('giveKeysToPlayer', (plyId: number, vehicle: number) => {
  const vin = getVinForVeh(vehicle);
  if (!vin) return;
  keyManager.addKey(vin, plyId);
});

Events.onNet('vehicles:keys:setVehicleDoorsLocked', (_, netId: number, locked: boolean) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  if (!entity || !DoesEntityExist(entity)) return;
  setVehicleDoorsLocked(entity, locked);
});

on('doorlock:server:useLockpick', (src: number, itemId: string) => {
  handleLockpickStart(src, {
    itemId,
  });
});

Inventory.registerUseable('car_hack_tool', async (plyId, itemState) => {
  const hasLaptop = await Inventory.doesPlayerHaveItems(plyId, ['laptop']);
  if (!hasLaptop) {
    Notifications.add(plyId, 'Je hebt geen laptop om dit in te steken', 'error');
    return;
  }
  handleLockpickStart(plyId, {
    itemId: itemState.id,
    overrideLockpickType: 'hack',
    skipDispatch: true,
  });
});

Events.onNet('vehicles:keys:finishLockPick', handleLockpickFinish);

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

  const locked = !getVehicleDoorsLocked(vehicle);
  const soundName = locked ? 'car_lock' : 'car_unlock';

  setVehicleDoorsLocked(vehicle, locked);
  Sounds.playOnEntity(`vehicles_car_key_lock_${netId}`, soundName, 'DLC_NUTTY_SOUNDS', netId);

  Notifications.add(plyId, locked ? 'Voertuig op slot gezet' : 'Voertuig opengedaan');
});

global.exports('setVehicleCannotBeLockpicked', setVehicleCannotBeLockpicked);
global.exports('skipDispatchOnLockpickForVin', skipDispatchOnLockpickForVin);

Events.onNet('vehicles:keys:policeTakeKeys', (plyId: number) => {
  if (Jobs.getCurrentJob(plyId) !== 'police') return;
  handleLockpickStart(plyId, {
    skipDispatch: true,
    isSlimjim: true,
  });
});
