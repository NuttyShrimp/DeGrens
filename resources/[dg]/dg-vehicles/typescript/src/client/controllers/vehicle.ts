import { RPC, Util } from '@dgx/client';
import { isCloseToADoor, isCloseToAWheel, isCloseToHood } from '../helpers/vehicle';

RPC.register('vehicle:checkModel', (model: string): ModelInfo => {
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

// When spawning vehicle on server, if model is not loaded yet for owner, the setheading native on server will NOT work
onNet('vehicle:setHeading', async (netId: number, heading: number) => {
  const exists = await Util.awaitEntityExistence(netId, true);
  if (!exists) return;
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  SetEntityHeading(vehicle, heading);
});
