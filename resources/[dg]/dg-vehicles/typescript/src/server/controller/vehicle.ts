import { Notifications, RPC, Util } from '@dgx/server';
import { getPlayerVehicleInfo, insertNewVehicle } from 'db/repository';
import {
  deleteVehicle,
  getVinForNetId,
  getVinForVeh,
  setEngineState,
  spawnOwnedVehicle,
  spawnVehicle,
  teleportInSeat,
} from '../helpers/vehicle';
import vinManager from '../modules/identification/classes/vinmanager';
import { mainLogger } from '../sv_logger';
import plateManager from 'modules/identification/classes/platemanager';
import { TUNE_PARTS } from '../../shared/upgrades/constants.upgrades';
import { getConfigByEntity } from 'modules/info/service.info';
import { getVehicleHarnessUses } from 'modules/seatbelts/service.seatbelts';
import { getCurrentVehicleStance } from 'modules/stances/service.stances';
import { getVehicleWaxExpirationDate } from 'modules/carwash/service.carwash';
import { getVehicleNosAmount } from 'modules/nos/service.nos';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

RPC.register('vehicles:getVehicleByVin', (src, vin: string) => {
  mainLogger.silly(`Request to get vehicle by vin: ${vin}`);
  return vinManager.getNetId(vin);
});

global.asyncExports('spawnVehicle', spawnVehicle);
global.exports('deleteVehicle', deleteVehicle);
global.exports('getVinForVeh', getVinForVeh);
global.exports('getVinForNetId', getVinForNetId);
global.exports('setEngineState', setEngineState);
global.asyncExports('giveNewVehicle', async (model: string, owner: number) => {
  const vin = vinManager.generateVin();
  const plate = plateManager.generatePlate();
  vinManager.addPlayerVin(vin);
  plateManager.addPlayerPlate(plate);
  await insertNewVehicle(vin, owner, model, plate);
  return true;
});

global.exports(
  'spawnVehicleFromAdminMenu',
  async (plyId: number, model?: string, vin?: string, applyMods?: boolean) => {
    const ped = GetPlayerPed(String(plyId));
    const position = {
      ...Util.getEntityCoords(ped),
      w: GetEntityHeading(ped),
    };

    let vehicle: number | null = null;
    if (vin) {
      const vehicleInfo = await getPlayerVehicleInfo(vin);
      if (!vehicleInfo) {
        Notifications.add(plyId, 'VIN does not belong to player vehicle', 'error');
        return;
      }
      const ent = await spawnOwnedVehicle(plyId, vehicleInfo, position, true);
      if (!ent) {
        Notifications.add(plyId, 'Could not spawn owned vehicle', 'error');
        return;
      }
      vehicle = ent;
    } else {
      if (!model) {
        Notifications.add(plyId, 'Geen voertuig geselecteerd', 'error');
        return;
      }

      let upgrades: Vehicles.Upgrades.Performance.Upgrades | undefined = undefined;
      if (applyMods) {
        upgrades = (Object.entries(TUNE_PARTS) as ObjEntries<typeof TUNE_PARTS>).reduce((acc, [key, tune]) => {
          // @ts-ignore
          acc[key] = tune.amount === 1 ? true : tune.amount - 1;
          return acc;
        }, {} as Vehicles.Upgrades.Performance.Upgrades);
      }

      const spawnedVehicle = await spawnVehicle({
        model,
        position,
        upgrades,
        keys: plyId,
        fuel: 100,
        engineState: true,
      });
      if (!spawnedVehicle) {
        Notifications.add(plyId, 'Could not spawn new vehicle', 'error');
        return;
      }
      vehicle = spawnedVehicle.vehicle;
    }

    teleportInSeat(plyId, vehicle);
  }
);

global.asyncExports('getPlateForVin', async (vin: string) => {
  const info = await getPlayerVehicleInfo(vin);
  if (!info) return;
  return info.plate;
});

global.exports('locateVehicleFromAdminMenu', (plyId: number, vin: string) => {
  const netId = vinManager.getNetId(vin);
  if (!netId) {
    Notifications.add(plyId, 'Kan voertuig niet vinden', 'info');
    return;
  }

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) {
    Notifications.add(plyId, 'Kan voertuig niet vinden', 'info');
    return;
  }

  const coords = Util.getEntityCoords(vehicle);
  Util.setWaypoint(plyId, coords);
});

// This export will take an entity handle, and insert said vehicle into player_vehicles table so it becomes owned
global.exports(
  'setExistingVehicleAsPlayerOwned',
  async (vehicle: number, ownerCid: number, vinscratched = false): Promise<boolean> => {
    if (!DoesEntityExist(vehicle)) {
      mainLogger.warn(`[setExistingVehicleAsPlayerOwned] Vehicle does not exist`);
      return false;
    }
    const vin = getVinForVeh(vehicle);
    if (!vin) {
      mainLogger.warn(`[setExistingVehicleAsPlayerOwned] Vehicle ${vehicle} does not have a vin`);
      return false;
    }
    if (vinManager.isVinFromPlayerVeh(vin)) {
      mainLogger.warn(`[setExistingVehicleAsPlayerOwned] ${vin} is already owned`);
      return false;
    }
    const vehConfig = getConfigByEntity(vehicle);
    if (!vehConfig) {
      mainLogger.warn(`[setExistingVehicleAsPlayerOwned] Failed to get vehicle config`);
      return false;
    }

    const plate = plateManager.getVehiclePlate(vehicle);
    const cosmeticUpgrades = await upgradesManager.getAppliedVehicleCosmeticUpgrades(vehicle);

    await insertNewVehicle(
      vin,
      ownerCid,
      vehConfig.model,
      plate,
      null,
      'out',
      undefined,
      getVehicleHarnessUses(vehicle) ?? 0,
      getCurrentVehicleStance(vehicle),
      getVehicleWaxExpirationDate(vin),
      getVehicleNosAmount(vehicle),
      cosmeticUpgrades,
      vinscratched
    );

    vinManager.addPlayerVin(vin);
    plateManager.addPlayerPlate(plate);

    return true;
  }
);
