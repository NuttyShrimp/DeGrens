import { RPC } from '@dgx/client';

import {
  getVehicleVin,
  getVehicleVinWithoutValidation,
  isCloseToADoor,
  isCloseToAWheel,
  isCloseToHood,
} from '../helpers/vehicle';

RPC.register('vehicle:checkModel', (model: string): modelInfo => {
  return {
    valid: IsModelValid(model) && IsModelAVehicle(model),
    automobile: IsThisModelACar(model),
  };
});

RPC.register('vehicle:getArchType', (netId: number): string => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  if (!DoesEntityExist(entity)) return 'UNKNOWN';
  return GetEntityArchetypeName(entity);
});

RPC.register('vehicle:getClass', (vehNetId: number) => {
  const veh = NetToVeh(vehNetId);
  return !veh || !DoesEntityExist(veh) ? -1 : GetVehicleClass(veh);
});

RPC.register('vehicles:isNearEngine', (vehNetId: number, distance: number, mustBeOpen = false) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!veh || !DoesEntityExist(veh)) return false;
  return isCloseToHood(veh, distance, mustBeOpen);
});

RPC.register('vehicles:isNearWheel', (vehNetId: number, distance: number) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!veh || !DoesEntityExist(veh)) return false;
  return isCloseToAWheel(veh, distance);
});

RPC.register('vehicles:isNearDoor', (vehNetId: number, distance: number) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!veh || !DoesEntityExist(veh)) return false;
  return isCloseToADoor(veh, distance);
});

global.asyncExports('getVehicleVin', getVehicleVin);
global.exports('getVehicleVinWithoutValidation', getVehicleVinWithoutValidation);
