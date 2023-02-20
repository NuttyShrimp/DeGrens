import { BaseEvents } from '@dgx/server';
import { validateVehicleVin } from '../modules/identification/service.id';
import { handleVehicleLock } from '../modules/keys/service.keys';
// import seatingService from '../services/seating';

BaseEvents.onEnteringVehicle((plyId, vehNetId, vehicleClass) => {
  validateVehicleVin(vehNetId);
  handleVehicleLock(plyId, vehNetId, vehicleClass);
  // seatingService.trySeating(plyId, vehNetId, seat);
});

// BaseEvents.onEnteredVehicle(plyId => {
//   seatingService.cancelSeating(plyId);
// });

// BaseEvents.onEnteringVehicleAborted(plyId => {
//   seatingService.cancelSeating(plyId);
// });
