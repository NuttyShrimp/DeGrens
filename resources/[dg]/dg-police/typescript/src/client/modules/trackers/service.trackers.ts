import { BlipManager, Events, Taskbar, Util } from '@dgx/client';
import { buildTrackerBlipId } from './helpers.trackers';

const activeBlips = new Set<number>();

export const setVehicleTracker = (trackerId: number, coords: Vec3, blipColor: number) => {
  const blipId = buildTrackerBlipId(trackerId);

  if (activeBlips.has(trackerId)) {
    BlipManager.changeBlipCoords(blipId, coords);
    return;
  }

  BlipManager.addBlip({
    category: 'police_trackers',
    id: blipId,
    coords,
    sprite: 225,
    scale: 1.1,
    color: blipColor,
    text: 'Voertuig Tracker',
    display: 2,
    hiddenInLegend: true,
    flashes: true,
  });
  activeBlips.add(trackerId);
};

export const removeTrackerBlip = (trackerId: number) => {
  if (!activeBlips.has(trackerId)) return;
  BlipManager.removeBlip(buildTrackerBlipId(trackerId));
  activeBlips.delete(trackerId);
};

export const disableVehicleTracker = async (vehicle: number) => {
  const trackerId = Entity(vehicle).state.trackerId;
  if (!trackerId) return;

  const heading = Util;

  const [canceled] = await Taskbar.create('location-dot-slash', 'Tracker Uitschakelen', 15000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      combat: true,
      carMovement: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 0,
    },
  });
  if (canceled) return;

  Events.emitNet('police:trackers:disable', trackerId);
};

export const removeAllTrackerBlips = () => {
  BlipManager.removeCategory('police_trackers');
  activeBlips.clear();
};
