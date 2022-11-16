import { Events, Peek } from '@dgx/client/classes';
import {
  doesVehicleHaveTracker,
  disableVehicleTracker,
  setVehicleTracker,
  removeTrackerBlip,
} from './service.trackers';

onNet('police:trackers:setTrackerCoords', (netId: number, x: number, y: number, z: number) => {
  setVehicleTracker(netId, { x, y, z });
});

Events.onNet('police:trackers:removeTracker', (netId: number) => {
  removeTrackerBlip(netId);
});

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Tracker uitschakelen',
      icon: 'fas fa-location-dot-slash',
      job: 'police',
      action: (_, vehicle) => {
        if (!vehicle) return;
        const netId = NetworkGetNetworkIdFromEntity(vehicle);
        disableVehicleTracker(netId);
      },
      canInteract: vehicle => {
        if (!vehicle) return false;
        const netId = NetworkGetNetworkIdFromEntity(vehicle);
        return doesVehicleHaveTracker(netId);
      },
    },
  ],
  distance: 1.5,
});
