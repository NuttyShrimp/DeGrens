import { Hospital, Notifications, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

// 1 tick = 500ms

let ticksOnLadder = 0;
const MAX_TICKS = 60; // 30 sec

let ticksStationaryOnLadder = 0;
const MAX_TICKS_STATIONARY = 12; // 6 sec

let previousPosition = new Vector3(0, 0, 0);

// anti ladder camp mongooltjes fuck u
export const startLadderThread = () => {
  setInterval(() => {
    const ped = PlayerPedId();
    const isOnLadder = GetPedConfigFlag(ped, 388, false);

    if (!isOnLadder) {
      ticksOnLadder = 0;
      ticksStationaryOnLadder = 0;
      return;
    } else {
      ticksOnLadder++;
    }

    const newPosition = Util.getPlyCoords();
    if (previousPosition.distance(newPosition) < 0.5) {
      ticksStationaryOnLadder++;
    } else {
      ticksStationaryOnLadder = 0;
    }
    previousPosition = newPosition;

    if (ticksOnLadder >= MAX_TICKS || ticksStationaryOnLadder >= MAX_TICKS_STATIONARY) {
      ticksOnLadder = 0;
      ticksStationaryOnLadder = 0;
      Notifications.add('Je bent uitgegleden', 'error');

      // if this happens ur a fucking bitch and deserve to die honestly
      ClearPedTasksImmediately(ped);
      setTimeout(() => {
        SetPedToRagdollWithFall(ped, 1000, 1500, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0);
      }, 50);
    }
  }, 500);
};
