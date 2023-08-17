import { Config, Sync, Util } from '@dgx/server';
import { updateVehicleWax } from 'db/repository';
import vinManager from 'modules/identification/classes/vinmanager';

import { carwashLogger } from './logger.carwash';

const vehiclesWithWax: Map<string, { expirationDate: number; vehicle: number }> = new Map();

export const cleanVehicle = (vehicle: number) => {
  Sync.executeAction('vehicles:carwash:clean', vehicle);
};

export const addWaxedVehicle = (vin: string, expirationDate: number) => {
  const vehicle = vinManager.getEntity(vin);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  vehiclesWithWax.set(vin, { expirationDate, vehicle });
  cleanVehicle(vehicle);
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
    const currentData = Math.floor(Date.now() / (1000 * 60));

    for (const [vin, data] of vehiclesWithWax) {
      if (!DoesEntityExist(data.vehicle)) {
        vehiclesWithWax.delete(vin);
        continue;
      }
      if (data.expirationDate <= currentData) {
        removeVehicleWax(vin);
        continue;
      }
      cleanVehicle(data.vehicle);
    }
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

export const getVehicleWaxExpirationDate = (vin: string) => {
  return vehiclesWithWax.get(vin)?.expirationDate;
};
