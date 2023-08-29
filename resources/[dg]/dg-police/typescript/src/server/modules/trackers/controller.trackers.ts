import { Events, Jobs } from '@dgx/server';
import { trackersLogger } from './logger.trackers';
import {
  addTrackerToVehicle,
  changeVehicleTrackerDelay,
  getAmountOfActiveTrackers,
  isTrackerActive,
  removeTrackerFromVehicle,
} from './service.trackers';

global.exports('addTrackerToVehicle', addTrackerToVehicle);
global.exports('removeTrackerFromVehicle', removeTrackerFromVehicle);
global.exports('changeVehicleTrackerDelay', changeVehicleTrackerDelay);
global.exports('isTrackerActive', isTrackerActive);

Events.onNet('police:trackers:disable', (plyId: number, trackerId: number) => {
  const job = Jobs.getCurrentJob(plyId);
  if (job !== 'police') {
    trackersLogger.error(`Player ${plyId} tried to remove tracker from vehicle but was not police`);
    return;
  }

  removeTrackerFromVehicle(trackerId);
});

// remove all trackers when player goes off duty
Jobs.onJobUpdate((plyId, job) => {
  if (!!job) return;
  if (getAmountOfActiveTrackers() === 0) return;

  Events.emitNet('police:trackers:removeAll', plyId);
});
