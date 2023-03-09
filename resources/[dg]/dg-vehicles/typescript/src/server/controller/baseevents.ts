import { BaseEvents } from '@dgx/server';
import { validateVehicleVin } from '../modules/identification/service.id';

BaseEvents.onEnteringVehicle((plyId, netId, vehicleClass) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  validateVehicleVin(vehicle, vehicleClass);
});
