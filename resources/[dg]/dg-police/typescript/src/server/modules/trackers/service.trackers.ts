import { Events, Jobs, Sounds, Util } from '@dgx/server';
import { trackersLogger } from './logger.trackers';

const activeTrackers: Police.Trackers.Tracker[] = [];

export const addTrackerToVehicle = (netId: number, delay: number) => {
  // Check if tracker already exists, if so remove
  const existingIdx = activeTrackers.findIndex(t => t.netId === netId);
  if (existingIdx !== -1) {
    clearInterval(activeTrackers[existingIdx].interval);
    activeTrackers.splice(existingIdx, 1);
    trackersLogger.silly(`Removing tracker from vehicle ${netId} to add a new tracker`);
  }

  emitTrackerLocationToPolice(netId);
  const interval = setInterval(() => {
    emitTrackerLocationToPolice(netId);
  }, delay);

  activeTrackers.push({ netId, interval });
  trackersLogger.silly(`Adding tracker to vehicle ${netId}`);
};

const emitTrackerLocationToPolice = (netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!DoesEntityExist(vehicle)) {
    removeTrackerFromVehicle(netId);
    return;
  }
  const coordsArray = GetEntityCoords(vehicle);
  Jobs.getPlayersForJob('police').forEach(plyId => {
    emitNet('police:trackers:setTrackerCoords', plyId, netId, ...coordsArray);
  });
  // Replace with custom single beep sound that is louder, this one works fine but enginesound makes it unhearable
  Sounds.playOnEntity(`police_tracker_sound_${netId}`, 'PIN_BUTTON', 'ATM_SOUNDS', netId);
};

export const removeTrackerFromVehicle = (netId: number) => {
  const existingIdx = activeTrackers.findIndex(t => t.netId === netId);
  if (existingIdx === -1) return;
  clearInterval(activeTrackers[existingIdx].interval);
  activeTrackers.splice(existingIdx, 1);
  trackersLogger.silly(`Removing tracker from vehicle ${netId}`);
  Jobs.getPlayersForJob('police').forEach(plyId => {
    Events.emitNet('police:trackers:removeTracker', plyId, netId);
  });
};
