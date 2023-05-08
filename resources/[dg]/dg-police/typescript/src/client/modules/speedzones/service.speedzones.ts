import { Events, Jobs, PolyZone, Vehicles } from '@dgx/client';
import { EXCLUDED_JOBS, MINIMUM_STRESS_INCREASE, SPEED_LIMIT, STRESS_PER_KPH } from './constants.speedzones';

export const buildSpeedZones = (zones: Police.Speedzones.Config) => {
  for (const [name, data] of Object.entries(zones)) {
    PolyZone.addBoxZone(`police_speedzone`, data.center, data.width, data.length, {
      heading: data.heading,
      minZ: data.center.z - 2,
      maxZ: data.center.z + 6,
      data: {
        id: name,
      },
    });
  }
};

export const enteredSpeedZone = () => {
  if (EXCLUDED_JOBS.includes(Jobs.getCurrentJob().name ?? '')) return;

  const vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const vehicleSpeed = Vehicles.getVehicleSpeed(vehicle);
  const speedOverLimit = vehicleSpeed - SPEED_LIMIT;
  if (speedOverLimit <= 0) return;

  Events.emitNet('hud:server:changeStress', calculateStressIncrease(speedOverLimit));
};

const calculateStressIncrease = (speed: number) => MINIMUM_STRESS_INCREASE + speed * STRESS_PER_KPH;
