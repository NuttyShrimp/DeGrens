import { Auth } from '@dgx/server';
import { initAtmRobberyToClient } from 'modules/atm/service.atm';
import { handleEntityRemovalForMethrunVehicle, initMethRunForPlayer } from 'modules/methrun/service.methrun';
import { dispatchParkingMeterModelsToClient } from 'modules/parkingmeters/service.parkingmeters';
import { sendWeedPlantModelsToClient } from 'modules/weed/service.weed';

Auth.onAuth(plyId => {
  sendWeedPlantModelsToClient(plyId);
  initAtmRobberyToClient(plyId);
  dispatchParkingMeterModelsToClient(plyId);
  initMethRunForPlayer(plyId);
});

on('entityRemoved', (entity: number) => {
  handleEntityRemovalForMethrunVehicle(entity);
});
