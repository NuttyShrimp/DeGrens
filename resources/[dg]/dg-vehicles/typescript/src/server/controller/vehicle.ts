import { Chat, Events, Inventory, Notifications, RPC, Util } from '@dgx/server';
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
import { tuneItems } from 'modules/upgrades/constants.upgrades';

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
      fuelManager.setFuelLevel(ent, 100);
      vehicle = ent;
    }

    // This is some cursed shit lol
    if (applyMods) {
      setTimeout(() => {
        if (!vehicle) return;
        if (!vin) return;
        const vehClass = getConfigByEntity(vehicle)?.class;
        if (!vehClass) return;
        const allPossibleTuneItems = tuneItems[vehClass];
        const tunes = [
          ...allPossibleTuneItems.reduce<Set<string>>((acc, cur) => {
            acc.add(cur.split('_')[1]);
            return acc;
          }, new Set()),
        ];
        const itemNames = tunes
          .map(t =>
            allPossibleTuneItems.reduceRight<string | undefined>((itemName, n) => {
              if (itemName) return itemName;
              if (n.split('_')[1] === t) {
                return n;
              }
            }, undefined)
          )
          .filter(n => !!n) as string[];
        itemNames.forEach(item => {
          Inventory.addItemToInventory('tunes', vin!, item, 1);
        });
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
