import { Events, Jobs, PolyZone, Util } from '@dgx/client';
import { EXCLUDED_JOBS } from './constants.speedzones';

export const buildSpeedZones = (zones: Police.Speedzones.Config) => {
  for (const [name, data] of Object.entries(zones)) {
    PolyZone.addBoxZone(`police_speedzone`, data.center, data.width, data.length, {
      heading: data.heading,
      minZ: data.center.z - 5,
      maxZ: data.center.z + 25,
      data: {
        id: name,
      },
    });
  }
};

export const enteredSpeedZone = () => {
  if (EXCLUDED_JOBS.includes(Jobs.getCurrentJob().name ?? '')) return;
  const speedOverLimit = Math.min(Math.round(GetEntitySpeed(PlayerPedId()) * 3.6), 300) - 100; // limit to 300kph than subtract minimum of 100kph
  if (speedOverLimit <= 0) return;
  const increase = 10 + 10 * (speedOverLimit / 200); // Limit is 0 - 200 so get percentage
  Events.emitNet('hud:server:GainStress', increase);
};
