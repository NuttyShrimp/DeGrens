import { Chat, Events, Notifications, RPC, Util } from '@dgx/server';
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
import { applyUpgradesToVeh } from '../modules/upgrades/service.upgrades';
import { mainLogger } from '../sv_logger';

RPC.register('vehicles:getVehicleByVin', (src, vin: string) => {
  mainLogger.silly(`Request to get vehicle by vin: ${vin}`);
  return vinManager.getNetId(vin);
});

global.asyncExports('spawnVehicle', spawnVehicle);
global.exports('deleteVehicle', deleteVehicle);
global.exports('getVinForVeh', getVinForVeh);
global.exports('getVinForNetId', getVinForNetId);
global.exports('setEngineState', setEngineState);

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
      const ent = await spawnVehicle(model, position, plyId, vin);
      if (!ent) {
        Notifications.add(plyId, 'Could not spawn new vehicle', 'error');
        return;
      }
      keyManager.addKey(vin, plyId);
      fuelManager.setFuelLevel(vin, 100);
      vehicle = ent;
    }
    if (applyMods) {
      const vehNetId = NetworkGetNetworkIdFromEntity(vehicle);
      // TODO: Spawn upgrade items in tunes inventory
      const mods = await RPC.execute('vehicles:upgrades:getAllUpgradePossibilities', plyId, vehNetId);
      applyUpgradesToVeh(vehNetId, mods);
    }
    teleportInSeat(String(plyId), vehicle);
  }
);

Chat.registerCommand('giveDevCar', 'Puts a car in the DB', [], 'developer', async source => {
  insertNewVehicle(vinManager.generateVin(), Player(source).state.cid, 'elegy', 'dev-123');
});

Events.onNet('vehicles:server:setOnGround', (src: number, netId: number) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  if (!entity || !DoesEntityExist(entity)) return;
  Util.sendEventToEntityOwner(entity, 'vehicles:client:setOnGround', netId);
});

global.asyncExports('getPlateForVin', async (vin: string) => {
  if (!vinManager.isVinFromPlayerVeh(vin)) return;
  const info = await getPlayerVehicleInfo(vin);
  return info.plate;
});
