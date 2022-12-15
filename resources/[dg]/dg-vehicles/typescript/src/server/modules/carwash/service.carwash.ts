import { Config, Util } from '@dgx/server';
import { updateVehicleWax } from 'db/repository';
import vinManager from 'modules/identification/classes/vinmanager';

import { carwashLogger } from './logger.carwash';

const vehiclesWithWax: Map<string, { expirationDate: number; netId: number }> = new Map();

export const cleanVehicle = (netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (!DoesEntityExist(veh)) return;
  SetVehicleDirtLevel(veh, 0.0);
  Util.sendEventToEntityOwner(veh, 'vehicles:carwash:cleanDecals', netId);
};

export const addWaxedVehicle = (vin: string, expirationDate: number) => {
  const netId = vinManager.getNetId(vin);
  if (!netId) return;
  vehiclesWithWax.set(vin, { expirationDate, netId });
  cleanVehicle(netId);
};

export const applyWaxItem = async (plyId: number, vin: string) => {
  const waxTime = Config.getConfigValue<{ waxTime: number }>('vehicles.config')?.waxTime ?? 0;
  const expirationDate = Math.floor(Date.now() / (1000 * 60) + waxTime * 24 * 60);
  addWaxedVehicle(vin, expirationDate);
  if (vinManager.isVinFromPlayerVeh(vin)) {
    await updateVehicleWax(vin, expirationDate);
  }
  carwashLogger.info(`Wax has been added to vehicle ${vin}`);
  Util.Log(
    'vehicles:wax:applied',
    {
      plyId,
      vin,
    },
    `${GetPlayerName(String(plyId))} has applied wax to a vehicle`
  );
};

export const startWaxThread = () => {
  setInterval(() => {
    // Cache and modify vehiclesWithWax after looping
    const waxToRemove: string[] = [];

    const currentData = Math.floor(Date.now() / (1000 * 60));
    vehiclesWithWax.forEach((data, vin) => {
      if (data.expirationDate <= currentData) {
        waxToRemove.push(vin);
      }
      cleanVehicle(data.netId);
    });

    waxToRemove.forEach(vin => removeVehicleWax(vin));
  }, 1000 * 30);
};

const removeVehicleWax = (vin: string) => {
  Util.Log(
    'vehicles:wax:expired',
    {
      vin,
    },
    `Wax for vehicle has expired`
  );
  carwashLogger.info(`Wax for vehicle ${vin} has expired`);
  updateVehicleWax(vin, null);
  vehiclesWithWax.delete(vin);
};
