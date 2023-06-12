import { Keys, Notifications, Vehicles } from '@dgx/client';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';

let limiterOn = false;
const MINIMUM_SPEED = 30;

Keys.register('toggle-speedlimiter', 'Toggle Speedlimiter', 'N');
Keys.onPressDown('toggle-speedlimiter', () => {
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) return;
  if (!doesVehicleHaveLimiter(veh)) {
    Notifications.add('Dit voertuig heeft geen snelheidsbegrenzer', 'error');
    return;
  }

  if (limiterOn) {
    disableSpeedLimiter(veh);
    limiterOn = false;
    return;
  }

  const vehSpeed = Vehicles.getVehicleSpeed(veh);
  if (vehSpeed < MINIMUM_SPEED) {
    Notifications.add(`Minimum snelheid: ${MINIMUM_SPEED}km/u`, 'error');
    return;
  }

  Notifications.add(`Snelheidsbegrenzer ingeschakeld op ${vehSpeed}km/u`, 'success');
  SetVehicleMaxSpeed(veh, GetEntitySpeed(veh));
  limiterOn = true;
});

const doesVehicleHaveLimiter = (vehicle: number) => {
  const vehClass = GetVehicleClass(vehicle);
  const noLimiterClasses = [13, 14, 15, 16, 21];
  return noLimiterClasses.every(c => vehClass !== c);
};

export const disableSpeedLimiter = (vehicle: number) => {
  if (!limiterOn) return;
  Notifications.add('Snelheidsbegrenzer uitgeschakeld');
  SetVehicleMaxSpeed(vehicle, 0);
};
