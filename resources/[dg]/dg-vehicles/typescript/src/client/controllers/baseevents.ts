import { resetNos, updateVehicleNosAmount } from 'modules/nos/service.nos';
import { cleanSeatbeltThread, startSeatbeltThread } from 'modules/seatbelts/service.seatbelts';
import { clearVehicleRolloverThread, startVehicleRolloverThread } from 'services/flipcar';
import { startNoShuffleThread, stopNoShuffleThread } from 'services/seats';
import { disableSpeedLimiter } from 'services/speedlimiter';

import { setCurrentVehicle } from '../helpers/vehicle';
import { cleanFuelThread, startFuelThread, fetchFuelLevelOnEnter } from '../modules/fuel/service.fuel';
import { startStatusThread } from '../modules/status/service.status';
import { BaseEvents } from '@dgx/client';

BaseEvents.onEnteringVehicle(vehicle => {
  SetVehicleNeedsToBeHotwired(vehicle, false);
});

BaseEvents.onEnteredVehicle((vehicle, seat) => {
  setCurrentVehicle(vehicle, seat === -1);
  startSeatbeltThread(vehicle);
  SetVehicleAutoRepairDisabled(vehicle, true); // Disabled repair on extra
  startNoShuffleThread(vehicle);
  DisplayRadar(true);
  fetchFuelLevelOnEnter(vehicle);

  if (seat !== -1) return;
  startStatusThread(vehicle);
  updateVehicleNosAmount(vehicle);
  startVehicleRolloverThread(vehicle);
  startFuelThread(vehicle);
});

BaseEvents.onLeftVehicle((vehicle, seat) => {
  if (seat === -1) {
    cleanFuelThread(vehicle);
    disableSpeedLimiter(vehicle);
    clearVehicleRolloverThread();
  }
  setCurrentVehicle(null, false);
  cleanSeatbeltThread();
  resetNos(vehicle);
  stopNoShuffleThread();
  DisplayRadar(false);
});

BaseEvents.onVehicleSeatChange((vehicle, newSeat, oldSeat) => {
  setCurrentVehicle(vehicle, newSeat === -1);
  if (oldSeat === -1) {
    cleanFuelThread(vehicle);
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
