import { Sync } from '@dgx/client';

export const toggleVehicleDoor = (vehicle: number, doorId: number) => {
  const isClosed = GetVehicleDoorAngleRatio(vehicle, doorId) === 0;
  Sync.executeAction('setVehicleDoorOpen', vehicle, doorId, isClosed);
};
