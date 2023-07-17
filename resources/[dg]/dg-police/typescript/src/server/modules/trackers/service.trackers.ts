import { Events, Jobs, Sounds, Util } from '@dgx/server';
import { trackersLogger } from './logger.trackers';
import { buildTrackerSoundId } from './helpers.trackers';

let currentTrackerId = 1;
const activeTrackers = new Map<number, { vehicle: number; interval: NodeJS.Timer }>();

export const addTrackerToVehicle = (vehicle: number, delay: number) => {
  const trackerId = currentTrackerId++;

  // first check if vehicle already has tracker, and remove
  for (const [tId, t] of activeTrackers) {
    if (t.vehicle !== vehicle) continue;
    removeTrackerFromVehicle(tId);
    break;
  }

  const interval = setInterval(() => {
    emitTrackerLocationToPolice(trackerId);
  }, delay);

  Entity(vehicle).state.set('trackerId', trackerId, true);
  activeTrackers.set(trackerId, {
    vehicle,
    interval,
  });
  trackersLogger.silly(`Adding tracker ${trackerId} to vehicle ${vehicle}`);

  // force emit location after adding active tracker to skip initial delay of interval
  emitTrackerLocationToPolice(trackerId);

  return trackerId;
};

const emitTrackerLocationToPolice = (trackerId: number) => {
  const vehicle = activeTrackers.get(trackerId)?.vehicle;
  if (!vehicle || !DoesEntityExist(vehicle)) {
    removeTrackerFromVehicle(trackerId);
    return;
  }

  const coords = Util.getEntityCoords(vehicle);
  Jobs.getPlayersForJob('police').forEach(plyId => {
    emitNet('police:trackers:setCoords', plyId, trackerId, coords);
  });

  // Replace with custom single beep sound that is louder, this one works fine but enginesound makes it unhearable
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  Sounds.playOnEntity(buildTrackerSoundId(trackerId), 'PIN_BUTTON', 'ATM_SOUNDS', netId);
};

export const removeTrackerFromVehicle = (trackerId: number) => {
  const tracker = activeTrackers.get(trackerId);
  if (!tracker) {
    trackersLogger.warn(`Tried to remove unknown tracker ${trackerId}`);
    return;
  }

  Sounds.stop(buildTrackerSoundId(trackerId));
  if (DoesEntityExist(tracker.vehicle)) {
    Entity(tracker.vehicle).state.set('trackerId', null, true);
  }

  clearInterval(tracker.interval);
  trackersLogger.silly(`Removing tracker ${trackerId} from vehicle ${tracker.vehicle}`);

  Jobs.getPlayersForJob('police').forEach(plyId => {
    Events.emitNet('police:trackers:remove', plyId, trackerId);
  });
};

export const getAmountOfActiveTrackers = () => activeTrackers.size;
