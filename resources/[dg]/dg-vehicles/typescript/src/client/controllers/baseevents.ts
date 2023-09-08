import { resetNos, updateVehicleNosAmount } from 'modules/nos/service.nos';
import { clearVehicleRolloverThread, startVehicleRolloverThread } from 'services/flipcar';
import { startNoShuffleThread, stopNoShuffleThread } from 'services/seats';
import { disableSpeedLimiter } from 'services/speedlimiter';

import { setCurrentVehicle } from '../helpers/vehicle';
import { cleanFuelThread, startFuelThread, fetchFuelLevelOnEnter } from '../modules/fuel/service.fuel';
import {
  cleanStatusThread,
  startStatusThread,
  startVehicleCrashThread,
  stopVehicleCrashThread,
} from '../modules/status/service.status';
import { BaseEvents } from '@dgx/client';
import { disableHarnassHUD, updateHarnassHUD } from 'modules/seatbelts/service.seatbelts';
import { driverThread } from 'threads/driver';
import { closeEngineSoundMenuOnVehicleExit } from 'services/enginesounds';

BaseEvents.onEnteringVehicle(vehicle => {
  SetVehicleNeedsToBeHotwired(vehicle, false);
});

BaseEvents.onEnteredVehicle((vehicle, seat) => {
  SetVehicleAutoRepairDisabled(vehicle, true); // Disabled repair on extra
  SetDisableVehiclePetrolTankDamage(vehicle, true);
  SetDisableVehiclePetrolTankFires(vehicle, true);
  DisplayRadar(true);

  // WILL SEE WHAT HAPPENS LOL
  SetVehicleHasBeenOwnedByPlayer(vehicle, true);

  setCurrentVehicle(vehicle, seat === -1);
  updateHarnassHUD(vehicle);
  startNoShuffleThread(vehicle);
  fetchFuelLevelOnEnter(vehicle);
  startVehicleCrashThread(vehicle);

  if (seat === -1) {
    driverThread.start();
    startStatusThread(vehicle);
    updateVehicleNosAmount(vehicle);
    startVehicleRolloverThread(vehicle);
    startFuelThread(vehicle);
  }
});

BaseEvents.onLeftVehicle((vehicle, seat) => {
  DisplayRadar(false);

  if (seat === -1) {
    driverThread.stop();
    cleanFuelThread(vehicle);
    disableSpeedLimiter(vehicle);
    clearVehicleRolloverThread();
    cleanStatusThread();
  }

  setCurrentVehicle(null, false);
  resetNos(vehicle);
  stopNoShuffleThread();
  disableHarnassHUD();
  stopVehicleCrashThread();
  closeEngineSoundMenuOnVehicleExit();
});

BaseEvents.onVehicleSeatChange((vehicle, newSeat, oldSeat) => {
  setCurrentVehicle(vehicle, newSeat === -1);

  if (oldSeat === -1) {
    driverThread.stop();
    cleanFuelThread(vehicle);
    resetNos(vehicle);
    disableSpeedLimiter(vehicle);
    clearVehicleRolloverThread();
    cleanStatusThread();
  }

  if (newSeat === -1) {
    driverThread.start();
    startFuelThread(vehicle);
    updateVehicleNosAmount(vehicle);
    startVehicleRolloverThread(vehicle);
    startStatusThread(vehicle);
  }
});
