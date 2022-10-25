import { validateVehicleVin } from '../modules/identification/service.id';
import { handleVehicleLock } from '../modules/keys/service.keys';
import seatingService from '../services/seating';

onNet('baseevents:enteringVehicle', (pVehNetId: number, pSeat: number) => {
  validateVehicleVin(pVehNetId);
  handleVehicleLock(source, pVehNetId);
  seatingService.tryEnteringVeh(source, pVehNetId, pSeat);
});

onNet('baseevents:enteredVehicle', (pVehNetId: number, pSeat: number) => {
  seatingService.enteredVeh(pVehNetId, pSeat);
});
