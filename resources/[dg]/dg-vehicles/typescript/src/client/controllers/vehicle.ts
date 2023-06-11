import { RPC, Util, Vehicles } from '@dgx/client';
import { isCloseToADoor, isCloseToAWheel } from '../helpers/vehicle';

RPC.register('vehicles:getModelType', (model: string): string | undefined => {
  if (!IsModelValid(model) || !IsModelAVehicle(model)) return;

  // why the fuck is the getVehicletype native only on serverside, now i need to use this cancerous method
  // returns the type arg accepted in CreateVehicleServerSetter
  if (IsThisModelACar(model)) return 'automobile';
  if (IsThisModelABike(model)) return 'bike';
  if (IsThisModelABoat(model)) return 'boat';
  if (IsThisModelAHeli(model)) return 'heli';
  if (IsThisModelAPlane(model)) return 'plane';
  if (IsThisModelASubmersible(model)) return 'submarine';
  if (IsThisModelATrain(model)) return 'trailer';
  if (IsThisModelATrain(model)) return 'train';
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
