import { Events, Jobs } from '@dgx/server';
import { trackersLogger } from './logger.trackers';
import { addTrackerToVehicle, removeTrackerFromVehicle } from './service.trackers';

global.exports('addTrackerToVehicle', addTrackerToVehicle);
global.exports('removeTrackerFromVehicle', removeTrackerFromVehicle);

Events.onNet('police:trackers:disable', (src: number, netId: number) => {
  const job = Jobs.getCurrentJob(src);
  if (job !== 'police') {
    trackersLogger.error(`Player ${src} tried to remove tracker from vehicle but was not police`);
    return;
  }

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  removeTrackerFromVehicle(vehicle);
});
