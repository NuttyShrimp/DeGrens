import { BaseEvents } from '@dgx/server';
import { disableEngineForNewVehicle, validateVehicleVin } from '../modules/identification/service.id';

// This is to add vin to unknown vehicles, almost always (parked) NPC vehicles
BaseEvents.onEnteringVehicle((plyId, netId, vehicleClass) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  validateVehicleVin(vehicle, vehicleClass);
});

BaseEvents.onEnteredVehicle((plyId, netId) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  disableEngineForNewVehicle(vehicle);
});
