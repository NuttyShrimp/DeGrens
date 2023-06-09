import { Auth, Events, RPC } from '@dgx/server';
import { setAllVehiclesInGarage } from 'db/repository';
import fs from 'fs';

import { garageLogger } from './logger.garages';
import { isSchemaValid } from './schema.garages';
import {
  areGaragesLoaded,
  doesCidHasAccess,
  GetGarages,
  isOnParkingSpot,
  recoverNonExistentVehicle,
  registerGarage,
  setGaragesLoaded,
  showPlayerGarage,
  startThread,
  stopThread,
  storeVehicleInGarage,
  takeVehicleOutGarage,
} from './service.garages';
import { Util } from '@dgx/shared';

const root = GetResourcePath(GetCurrentResourceName());

setImmediate(async () => {
  setAllVehiclesInGarage();
  try {
    const fileNames = fs.readdirSync(`${root}/seeding/garages`, { encoding: 'utf8' });
    const successArr = await Promise.all(
      fileNames.map(async fileName => {
        return await new Promise<boolean>(res => {
          try {
            const data = fs.readFileSync(`${root}/seeding/garages/${fileName}`, 'utf8');
            if (!isSchemaValid(data)) {
              garageLogger.error(`Garage file(${fileName}) is not valid`);
              return;
            }
            registerGarage(JSON.parse(data));
            res(true);
          } catch (e) {
            garageLogger.error(`Error while reading a garage file(${fileName}): ${e}`);
            res(false);
          }
        });
      })
    );
    if (successArr.some(x => !x)) return;
    garageLogger.info(`${fileNames.length} garage(s) loaded`);
    setGaragesLoaded();
  } catch (e) {
    garageLogger.error(`Error while loading garage directory: ${e}`);
  }
});

Events.onNet('dg-vehicles:garages:open', (src: number) => {
  showPlayerGarage(src);
});

Events.onNet('vehicles:garage:takeVehicle', (src, vin: string) => {
  takeVehicleOutGarage(src, vin);
});

Events.onNet('vehicles:garage:park', (src, vehNetId: number) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!veh || !DoesEntityExist(veh)) return;
  storeVehicleInGarage(src, veh);
});

RPC.register('vehicles:garage:hasAccess', async (src, cid: number, garageId: string) => {
  return doesCidHasAccess(cid, garageId);
});

Events.onNet('vehicles:garage:enteredZone', (src: number, garageId: string) => {
  startThread(src, garageId);
});

Events.onNet('vehicles:garage:leftZone', (src: number) => {
  stopThread(src);
});

RPC.register('vehicles:garage:isOnParkingSpot', (src, netId: number | null) => {
  return isOnParkingSpot(src, netId);
});

Events.onNet('vehicles:garage:recoverVehicle', async (plyId, vin: string) => {
  recoverNonExistentVehicle(plyId, vin);
});
