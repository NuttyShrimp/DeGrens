import { Notifications, RPC, Util } from '@dgx/server';
import { Vector4 } from '@dgx/shared';
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
    const position = Vector4.createFromVec3(Util.getEntityCoords(ped), GetEntityHeading(ped));

    let vehicle: number | null = null;
    if (vin) {
      const vehicleInfo = await getPlayerVehicleInfo(vin);
      if (!vehicleInfo) {
        Notifications.add(plyId, 'VIN does not belong to player vehicle', 'error');
        return;
      }
      const ent = await spawnOwnedVehicle(plyId, vehicleInfo, position);
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
        vin,
        upgrades,
        keys: plyId,
        fuel: 100,
      });
      if (!spawnedVehicle) {
        Notifications.add(plyId, 'Could not spawn new vehicle', 'error');
        return;
      }
      vehicle = spawnedVehicle.vehicle;
    }

    teleportInSeat(String(plyId), vehicle);
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
