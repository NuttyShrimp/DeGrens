import { Core, Events, RPC } from '@dgx/server';
import { setAllVehiclesInGarage } from 'db/repository';
import fs from 'fs';
import { garageLogger } from './logger.garages';
import { isSchemaValid } from './schema.garages';
import {
  doesCidHasAccess,
  isOnParkingSpot,
  openThreadedGarage,
  recoverVehicle,
  registerGarage,
  setGaragesLoaded,
  showPlayerGarage,
  startThread,
  stopThread,
  storeVehicleInGarage,
  takeVehicleOutGarage,
  unregisterGarage,
} from './service.garages';

const root = GetResourcePath(GetCurrentResourceName());

global.exports('registerGarage', (g: Vehicles.Garages.Garage) => {
  g.runtime = true;
  registerGarage(g);
});
global.exports('unregisterGarage', unregisterGarage);
asyncExports('openGarage', showPlayerGarage);

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
            const garageInfo: Vehicles.Garages.Garage = JSON.parse(data);
            registerGarage(garageInfo);
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
  openThreadedGarage(src);
});

Events.onNet('vehicles:garage:takeVehicle', (src, vin: string, garageId: string) => {
  takeVehicleOutGarage(src, vin, garageId);
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

Core.onPlayerUnloaded(plyId => {
  stopThread(plyId);
});

RPC.register('vehicles:garage:isOnParkingSpot', (src, netId: number | null) => {
  return isOnParkingSpot(src, netId);
});

Events.onNet('vehicles:garage:recoverVehicle', async (plyId, vin: string) => {
  recoverVehicle(plyId, vin);
});
