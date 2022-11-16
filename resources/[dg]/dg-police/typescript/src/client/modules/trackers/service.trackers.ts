import { Events, Taskbar } from '@dgx/client/classes';

const activeBlips = new Map<number, number>();

export const setVehicleTracker = (netId: number, coords: Vec3) => {
  const existingBlip = activeBlips.get(netId);
  if (existingBlip !== undefined && DoesBlipExist(existingBlip)) {
    SetBlipCoords(existingBlip, coords.x, coords.y, coords.z);
    return;
  }

  const newBlip = AddBlipForCoord(coords.x, coords.y, coords.z);
  SetBlipSprite(newBlip, 225);
  SetBlipScale(newBlip, 1.0);
  SetBlipAsShortRange(newBlip, false);
  SetBlipColour(newBlip, 5);
  SetBlipDisplay(newBlip, 2);
  SetBlipFlashInterval(newBlip, 200);
  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString('Voertuig Tracker');
  EndTextCommandSetBlipName(newBlip);
  activeBlips.set(netId, newBlip);
};

export const removeTrackerBlip = (netId: number) => {
  const activeBlip = activeBlips.get(netId);
  if (activeBlip === undefined) return;
  if (!DoesBlipExist(activeBlip)) return;
  RemoveBlip(activeBlip);
  activeBlips.delete(netId);
};

export const doesVehicleHaveTracker = (netId: number) => activeBlips.has(netId);

export const disableVehicleTracker = async (netId: number) => {
  if (!doesVehicleHaveTracker(netId)) return;

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

  Events.emitNet('police:trackers:disable', netId);
};
