import { Inventory, Notifications, SQL, Taskbar, Util } from '@dgx/server';
import { updateVehicleFakeplate } from 'db/repository';

import { getVinForNetId } from '../../helpers/vehicle';
import { fuelManager } from '../fuel/classes/fuelManager';

import vinManager from './classes/vinmanager';
import { idLogger } from './logger.id';

export const validateVehicleVin = (pNetId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(pNetId);
  const vehicleState = Entity(vehicle).state;
  if (vehicleState.vin && vinManager.doesVinMatch(vehicleState.vin, pNetId)) return;
  // This is for vehicles new to the server
  const vin = vinManager.generateVin(pNetId);
  vehicleState.set('vin', vin, true);
  vehicleState.set('plate', GetVehicleNumberPlateText(vehicle), true);
  fuelManager.registerVehicle(vin);
  SetVehicleDoorsLocked(vehicle, 2);
};

export const applyFakePlateItem = async (src: number, netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  // Check if near vehicle
  if (Util.getDistanceBetweenEntities(GetPlayerPed(String(src)), vehicle) > 4) {
    Notifications.add(src, 'Je staat niet dicht genoeg bij het voertuig', 'error');
    return;
  }
  const [wasCancelled] = await Taskbar.create(src, 'vehicles-apply-fakeplate', 'screwdriver', 'Monteren', 7500, {
    canCancel: true,
    cancelOnDeath: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      combat: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 1,
    },
  });
  if (wasCancelled) return;
  const plateItem = await Inventory.getFirstItemOfNameOfPlayer(src, 'fakeplate');
  if (!plateItem?.metadata.plate) {
    Notifications.add(src, 'Je hebt geen nummerplaat', 'error');
    return;
  }
  const isSuccess = await applyFakePlate(src, netId, plateItem.metadata.plate);
  if (!isSuccess) {
    Notifications.add(src, 'De nummerplaat kon niet worden toegepast', 'error');
    return;
  }
  Inventory.destroyItem(plateItem.id);
  Util.Log(
    'vehicles:fakeplate:applied',
    {
      vin,
      fakePlate: plateItem.metadata.plate,
      plate: GetVehicleNumberPlateText(vehicle),
    },
    `${GetPlayerName(String(src))} applied a fake plate ${plateItem.metadata.plate} to vehicle with VIN ${vin}`
  );
};

export const applyFakePlate = async (src: number, netId: number, plate: string) => {
  const vin = getVinForNetId(netId);
  if (!vin) {
    return false;
  }
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle) {
    return false;
  }
  const vehState = Entity(vehicle).state;
  if (!vehState) {
    return false;
  }
  if (vehState.fakePlate) {
    idLogger.warn(
      `${GetPlayerName(
        String(src)
      )} tried to apply a fake plate to vehicle with VIN ${vin} but it already has a fake plate, old: ${
        vehState.fakePlate
      } | new: ${plate}`
    );
    return false;
  }
  updateVehicleFakeplate(vin, plate);
  vehState.set('fakePlate', plate.toUpperCase(), true);
  SetVehicleNumberPlateText(vehicle, plate);
  return true;
};

export const removeFakePlate = async (src: number, netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (Util.getDistanceBetweenEntities(GetPlayerPed(String(src)), vehicle) > 4) {
    Notifications.add(src, 'Je staat niet dicht genoeg bij het voertuig', 'error');
    return;
  }
  const vehState = Entity(vehicle).state;
  if (!vehState.plate || vehState.plate.trim() === '') {
    // Vehicle not registered -->
    return;
  }
  if (!vehState.fakePlate || vehState.fakePlate.trim() === '') {
    Notifications.add(src, 'Dit voertuig heeft geen valse nummerplaat', 'error');
    return;
  }
  const [wasCancelled] = await Taskbar.create(
    src,
    'vehicles-remove-fakeplate',
    'screwdriver',
    'Schroeven losdraaien',
    7500,
    {
      canCancel: true,
      cancelOnDeath: true,
      disableInventory: true,
      controlDisables: {
        movement: true,
        combat: true,
      },
      animation: {
        animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
        anim: 'machinic_loop_mechandplayer',
        flags: 1,
      },
    }
  );
  if (wasCancelled) return;
  SetVehicleNumberPlateText(vehicle, vehState.plate);
  Inventory.addItemToPlayer(src, 'fakeplate', 1, { plate: vehState.fakePlate });
  vehState.set('fakePlate', undefined, true);
  updateVehicleFakeplate(vin, null);
};

export const getCidFromVin = async (vin: string) => {
  const result = await SQL.scalar(
    `SELECT *
                                   FROM player_vehicles
                                   WHERE vin = ?`,
    [vin]
  );
  if (!result) return undefined;
  return result.cid;
};

export const isPlayerVehicleOwner = async (playerId: number, vin: string) => {
  const ownerCid = await getCidFromVin(vin);
  const playerCid = Util.getCID(playerId);
  return ownerCid === playerCid;
};
