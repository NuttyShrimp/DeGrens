import { Events, Jobs, Sounds } from '@dgx/server';
import { trackersLogger } from './logger.trackers';

const activeTrackers = new Map<number, NodeJS.Timer>();

export const addTrackerToVehicle = (vehicle: number, delay: number) => {
  if (!DoesEntityExist(vehicle)) {
    trackersLogger.warn(`Tried to add tracker to nonexistent vehicle ${vehicle}`);
    return;
  }

  const existingTrackerInterval = activeTrackers.get(vehicle);
  if (existingTrackerInterval) {
    clearInterval(existingTrackerInterval);
    trackersLogger.silly(`Removing tracker from vehicle to add a new tracker ${vehicle}`);
  }

  emitTrackerLocationToPolice(vehicle);
  const interval = setInterval(() => {
    emitTrackerLocationToPolice(vehicle);
  }, delay);

  activeTrackers.set(vehicle, interval);
  trackersLogger.silly(`Adding tracker to vehicle ${vehicle}`);
};

const emitTrackerLocationToPolice = (vehicle: number) => {
  if (!DoesEntityExist(vehicle)) {
    removeTrackerFromVehicle(vehicle);
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);

  const coordsArray = GetEntityCoords(vehicle);
  Jobs.getPlayersForJob('police').forEach(plyId => {
    emitNet('police:trackers:setTrackerCoords', plyId, netId, ...coordsArray);
  });

  // Replace with custom single beep sound that is louder, this one works fine but enginesound makes it unhearable
  Sounds.playOnEntity(`police_tracker_sound_${netId}`, 'PIN_BUTTON', 'ATM_SOUNDS', netId);
};

export const removeTrackerFromVehicle = (vehicle: number) => {
  const existingTrackerInterval = activeTrackers.get(vehicle);
  if (!existingTrackerInterval) return;

  clearInterval(existingTrackerInterval);
  trackersLogger.silly(`Removing tracker from vehicle ${vehicle}`);

  if (DoesEntityExist(vehicle)) {
    const netId = NetworkGetNetworkIdFromEntity(vehicle);
    Jobs.getPlayersForJob('police').forEach(plyId => {
      Events.emitNet('police:trackers:removeTracker', plyId, netId);
    });
  }
};
