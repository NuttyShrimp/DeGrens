import { BaseEvents } from '@dgx/server';
import { disableEngineForNewVehicle, validateVehicleVin } from '../modules/identification/service.id';
import { validateVehicleLock } from 'modules/keys/service.keys';
import { fuelManager } from 'modules/fuel/classes/fuelManager';

// This is to add vin to unknown vehicles, almost always (parked) NPC vehicles
BaseEvents.onEnteringVehicle((plyId, netId, vehicleClass) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const { isNewVehicle } = validateVehicleVin(vehicle, vehicleClass);
  if (!isNewVehicle) {
    validateVehicleLock(vehicle);
  }
});

BaseEvents.onEnteredVehicle((plyId, netId) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  disableEngineForNewVehicle(vehicle);
});

BaseEvents.onLeftVehicle((plyId, netId, seat) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  // Save fuel when player stops becoming driver
  if (seat === -1) {
    fuelManager.saveFuel(vehicle);
  }
});

BaseEvents.onVehicleSeatChange((plyId, netId, __, oldSeat) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  // Save fuel when player stops becoming driver
  if (oldSeat === -1) {
    fuelManager.saveFuel(vehicle);
  }
});
