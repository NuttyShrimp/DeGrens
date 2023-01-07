import { resetNos, updateVehicleNosAmount } from 'modules/nos/service.nos';
import { cleanSeatbeltThread, startSeatbeltThread } from 'modules/seatbelts/service.seatbelts';
import { clearVehicleRolloverThread, startVehicleRolloverThread } from 'services/flipcar';
import { startNoShuffleThread, stopNoShuffleThread } from 'services/seats';
import { disableSpeedLimiter } from 'services/speedlimiter';

import { setCurrentVehicle } from '../helpers/vehicle';
import { cleanFuelThread, fetchVehicleFuelLevel, startFuelThread } from '../modules/fuel/service.fuel';
import { startStatusThread } from '../modules/status/service.status';

on('baseevents:enteringVehicle', (vehicle: number) => {
  SetVehicleNeedsToBeHotwired(vehicle, false);
});

on('baseevents:enteredVehicle', (vehicle: number, seat: number) => {
  setCurrentVehicle(vehicle, seat === -1);
  startSeatbeltThread(vehicle);
  fetchVehicleFuelLevel(vehicle, seat);
  SetVehicleAutoRepairDisabled(vehicle, true); // Disabled repair on extra
  startNoShuffleThread(vehicle);
  DisplayRadar(true);

  if (seat !== -1) return;
  startStatusThread(vehicle);
  updateVehicleNosAmount(vehicle);
  startVehicleRolloverThread(vehicle);
});

on('baseevents:leftVehicle', (vehicle: number, seat: number) => {
  if (seat === -1) {
    cleanFuelThread();
    disableSpeedLimiter(vehicle);
    clearVehicleRolloverThread();
  }
  setCurrentVehicle(null, false);
  cleanSeatbeltThread();
  resetNos(vehicle);
  stopNoShuffleThread();
  DisplayRadar(false);
});

on('baseevents:vehicleChangedSeat', (vehicle: number, newSeat: number, oldSeat: number) => {
  setCurrentVehicle(vehicle, newSeat === -1);
  if (oldSeat === -1) {
    cleanFuelThread();
    resetNos(vehicle);
    disableSpeedLimiter(vehicle);
    clearVehicleRolloverThread();
  }
  if (newSeat === -1) {
    startFuelThread(vehicle);
    updateVehicleNosAmount(vehicle);
    startVehicleRolloverThread(vehicle);
    startStatusThread(vehicle);
  }
});
