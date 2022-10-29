import { Events, RPC, Util } from '@dgx/client';

import { setDegradationValues } from './constant.status';
import { fixVehicle, setNativeStatus } from './service.status';

setImmediate(async () => {
  Events.emitNet('vehicles:server:requestDegradationValues');
});

Events.onNet(
  'vehicles:client:setNativeStatus',
  async (vehNetId: number, status: Omit<Vehicle.VehicleStatus, 'fuel'>) => {
    // Vehicle handles gets changed sometimes for a fucking reason when spawning, check netid
    const exists = await Util.awaitEntityExistence(vehNetId, true);
    if (!exists) return;
    setNativeStatus(NetworkGetEntityFromNetworkId(vehNetId), status);
  }
);

Events.onNet('vehicles:service:setDegradationValues', (values: Service.DegradationConfig) => {
  setDegradationValues(values);
});

RPC.register('vehicles:client:getWindowSate', (netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  const state = [];
  for (let i = 0; i < 8; i++) {
    //@ts-ignore return value is false or 1
    state.push(!(IsVehicleWindowIntact(veh, i) === 1));
  }
  return state;
});

RPC.register('vehicles:client:getDoorSate', (netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  const state = [];
  for (let i = 0; i < 6; i++) {
    //@ts-ignore return value is false or 1
    state.push(IsVehicleDoorDamaged(veh, i) === 1);
  }
  return state;
});

RPC.register('vehicles:client:getTyreState', (netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  const state = [];
  for (let i = 0; i < 10; i++) {
    state.push(IsVehicleTyreBurst(veh, i, true) ? -1 : GetTyreHealth(veh, i));
  }
  return state;
});

Events.onNet('vehicles:client:fixVehicle', (netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  fixVehicle(vehicle);
});