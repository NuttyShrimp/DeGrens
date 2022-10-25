import { Events } from '@dgx/client';

export const toggleVehicleDoor = (vehicle: number, doorId: number) => {
  const isClosed = GetVehicleDoorAngleRatio(vehicle, doorId) === 0;
  setVehicleDoorOpen(vehicle, doorId, isClosed);
};

const setVehicleDoorOpen = (vehicle: number, doorId: number, open: boolean) => {
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  Events.emitNet('vehicles:door:sync', netId, doorId, open);
};
global.exports('setVehicleDoorOpen', setVehicleDoorOpen);

Events.onNet('vehicles:door:sync', (netId: number, doorId: number, open: boolean) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  if (open) {
    SetVehicleDoorOpen(vehicle, doorId, false, false);
  } else {
    SetVehicleDoorShut(vehicle, doorId, false);
  }
});
