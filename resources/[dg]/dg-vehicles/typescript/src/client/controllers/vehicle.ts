import { RPC, Vehicles } from '@dgx/client';
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
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!veh || !DoesEntityExist(veh)) return -1;
  return GetVehicleClass(veh);
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

RPC.register('vehicles:getAllVehicleModels', () => GetAllVehicleModels());

RPC.register('vehicles:getNumberOfSeats', (model: string | number) => {
  const modelHash = typeof model === 'string' ? GetHashKey(model) : model;
  return +GetVehicleModelNumberOfSeats(modelHash);
});
