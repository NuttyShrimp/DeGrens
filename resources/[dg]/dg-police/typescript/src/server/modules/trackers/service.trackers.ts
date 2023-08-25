import { Events, Jobs, Sounds, Util } from '@dgx/server';
import { trackersLogger } from './logger.trackers';
import { buildTrackerSoundId } from './helpers.trackers';
import { TRACKER_BLIP_COLORS } from './constants.trackers';

let currentTrackerId = 0;
const activeTrackers = new Map<number, { vehicle: number; interval: NodeJS.Timer; blipColor: number }>();

export const addTrackerToVehicle = (vehicle: number, delay: number) => {
  if (delay < 1000) throw new Error('Tracker delay must be at least 1000ms');

  const trackerId = ++currentTrackerId;

  // first check if vehicle already has tracker, and remove
  for (const [tId, t] of activeTrackers) {
    if (t.vehicle !== vehicle) continue;
    removeTrackerFromVehicle(tId);
    break;
  }

  Entity(vehicle).state.set('trackerId', trackerId, true);
  activeTrackers.set(trackerId, {
    vehicle,
    interval: setInterval(() => {
      emitTrackerLocationToPolice(trackerId);
    }, delay),
    blipColor: TRACKER_BLIP_COLORS[Math.floor(Math.random() * TRACKER_BLIP_COLORS.length)],
  });
  trackersLogger.silly(`Adding tracker ${trackerId} to vehicle ${vehicle}`);

  // force emit location after adding active tracker to skip initial delay of interval
  emitTrackerLocationToPolice(trackerId);

  return trackerId;
};

const emitTrackerLocationToPolice = (trackerId: number) => {
  const tracker = activeTrackers.get(trackerId);
  if (!tracker || !DoesEntityExist(tracker.vehicle)) {
    removeTrackerFromVehicle(trackerId);
    return;
  }

  const coords = Util.getEntityCoords(tracker.vehicle);
  Jobs.getPlayersForJob('police').forEach(plyId => {
    emitNet('police:trackers:setCoords', plyId, trackerId, coords, tracker.blipColor);
  });

  const netId = NetworkGetNetworkIdFromEntity(tracker.vehicle);
  Sounds.playOnEntity(buildTrackerSoundId(trackerId), 'Count_Stop', 'GTAO_Speed_Race_Sounds', netId);
};

export const changeVehicleTrackerDelay = (trackerId: number, newDelay: number) => {
  if (newDelay < 1000) throw new Error('Tracker delay must be at least 1000ms');

  const tracker = activeTrackers.get(trackerId);
  if (!tracker) {
    trackersLogger.warn(`Tried to change tracker delay for unknown tracker ${trackerId}`);
    return;
  }

  if (!DoesEntityExist(tracker.vehicle)) {
    trackersLogger.warn(
      `Tried to change tracker delay for tracker ${trackerId} but vehicle ${tracker.vehicle} does not exist`
    );
    return;
  }

  clearInterval(tracker.interval);
  const newInterval = setInterval(() => {
    emitTrackerLocationToPolice(trackerId);
  }, newDelay);
  tracker.interval = newInterval;

  trackersLogger.silly(`Changing tracker ${trackerId} delay to ${newDelay}`);

  return trackerId;
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
  activeTrackers.delete(trackerId);
  trackersLogger.silly(`Removing tracker ${trackerId} from vehicle ${tracker.vehicle}`);

  Jobs.getPlayersForJob('police').forEach(plyId => {
    Events.emitNet('police:trackers:remove', plyId, trackerId);
  });
};

export const getAmountOfActiveTrackers = () => activeTrackers.size;
