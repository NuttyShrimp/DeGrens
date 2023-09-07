import { Events, Jobs, PolyZone, Util, Vehicles } from '@dgx/client';
import { EXCLUDED_JOBS } from './constants.speedzones';

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
  const vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const plyJob = Jobs.getCurrentJob().name ?? '';
  if (!Util.isDevEnv() && EXCLUDED_JOBS.includes(plyJob)) return;

  const vehicleSpeed = Vehicles.getVehicleSpeed(vehicle);
  Events.emitNet('police:speedzones:entered', NetworkGetNetworkIdFromEntity(vehicle), vehicleSpeed);
};
