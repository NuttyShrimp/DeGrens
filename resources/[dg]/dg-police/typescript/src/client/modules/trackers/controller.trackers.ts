import { Events, Peek } from '@dgx/client';
import { disableVehicleTracker, setVehicleTracker, removeTrackerBlip, removeAllTrackerBlips } from './service.trackers';

onNet('police:trackers:setCoords', setVehicleTracker);
Events.onNet('police:trackers:remove', removeTrackerBlip);
Events.onNet('police:trackers:removeAll', removeAllTrackerBlips);

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Tracker Afzetten',
      icon: 'fas fa-location-dot-slash',
      job: 'police',
      action: (_, vehicle) => {
        if (!vehicle) return;
        disableVehicleTracker(vehicle);
      },
      canInteract: vehicle => {
        if (!vehicle) return false;
        return !!Entity(vehicle).state.trackerId;
      },
    },
  ],
  distance: 1.5,
});
