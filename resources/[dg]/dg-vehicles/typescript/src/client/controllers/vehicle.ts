import { RPC, Util, Vehicles } from '@dgx/client';
import { getModelType, isCloseToADoor, isCloseToAWheel } from '../helpers/vehicle';

RPC.register('vehicles:getModelType', (model: string): string | undefined => {
  return getModelType(model);
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
  return Vehicles.isNearVehiclePlace(veh, 'bonnet', distance, mustBeOpen);
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
