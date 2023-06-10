import { Inventory, Notifications, RPC, Util } from '@dgx/server';
import { Vector4 } from '@dgx/shared';
import { getPlayerVehicleInfo, insertNewVehicle } from 'db/repository';
import { fuelManager } from 'modules/fuel/classes/fuelManager';
import { keyManager } from 'modules/keys/classes/keymanager';

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
import { getConfigByEntity } from 'modules/info/service.info';
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
    if (vin && vinManager.isVinFromPlayerVeh(vin)) {
      const vehicleInfo = await getPlayerVehicleInfo(vin);
      const position: Vec4 = { ...Util.getPlyCoords(plyId), w: GetEntityHeading(GetPlayerPed(String(plyId))) };

      const ent = await spawnOwnedVehicle(plyId, vehicleInfo, position);
      if (!ent) {
        Notifications.add(plyId, 'Could not spawn owned vehicle', 'error');
        return;
      }
      vehicle = ent;
    } else {
      if (!vin) {
        vin = vinManager.generateVin();
      }
      if (!model) {
        Notifications.add(plyId, 'Geen voertuig geselecteerd', 'error');
        return;
      }
      const spawnedVehicle = await spawnVehicle({ model, position, vin });
      if (!spawnedVehicle) {
        Notifications.add(plyId, 'Could not spawn new vehicle', 'error');
        return;
      }
      keyManager.addKey(vin, plyId);
      fuelManager.setFuelLevel(spawnedVehicle.vehicle, 100);
      vehicle = spawnedVehicle.vehicle;
    }

    // This is some cursed shit lol
    if (applyMods) {
      setTimeout(() => {
        if (!vehicle || !vin) return;
        const vehClass = getConfigByEntity(vehicle)?.class;
        if (!vehClass) return;

        for (const tune of Object.values(TUNE_PARTS)) {
          Inventory.addItemToInventory('tunes', vin, tune.itemName, 1, {
            class: vehClass,
            stage: tune.amount,
          });
        }
      }, 1000);
    }

    teleportInSeat(String(plyId), vehicle);
  }
);

global.asyncExports('getPlateForVin', async (vin: string) => {
  if (!vinManager.isVinFromPlayerVeh(vin)) return;
  const info = await getPlayerVehicleInfo(vin);
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
