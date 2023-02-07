import { Notifications, Util } from '@dgx/client';
import { isBennysMenuOpen } from 'modules/bennys/service.bennys';

import { isStanceMenuOpen } from './controller.stances';
import { NOTIFICATION_ID } from './constants.stances';

const closeVehicles: Map<number, Stance.Data> = new Map();
let stancingThread: NodeJS.Timer | null = null;
let activeNotification = '';

// Check for close vehicles that need stancing
export const startStanceCheckThread = () => {
  setInterval(() => {
    closeVehicles.clear();

    const vehicles: number[] = GetGamePool('CVehicle');
    vehicles.forEach(veh => {
      if (!DoesEntityExist(veh)) return;
      const distance = Util.getPlyCoords().distance(Util.getEntityCoords(veh));
      if (distance > 100) return;
      const stanceData = Entity(veh).state?.stance;
      if (!stanceData) return;
      closeVehicles.set(veh, stanceData);
    });

    if (closeVehicles.size !== 0) {
      startStancingThread();
    } else {
      stopStancingThread();
    }
  }, 2000);
};

// Apply visual stancing for close vehicles
const startStancingThread = () => {
  if (stancingThread !== null) return;

  stancingThread = setInterval(() => {
    // Cache so we dont remove from map while looping map
    const vehToRemove: number[] = [];

    closeVehicles.forEach((stance, veh) => {
      if (!DoesEntityExist(veh)) {
        vehToRemove.push(veh);
        return;
      }

      // If we in stance menu or bennys menu, we want it to instantly update instead of every 2 sec to preview new stance without delay
      if (isStanceMenuOpen() || isBennysMenuOpen()) {
        stance = Entity(veh).state.stance;
      }

      SetVehicleWheelXOffset(veh, 0, -stance.frontLeft);
      SetVehicleWheelXOffset(veh, 1, stance.frontRight);
      SetVehicleWheelXOffset(veh, 2, -stance.backLeft);
      SetVehicleWheelXOffset(veh, 3, stance.backRight);
    });

    vehToRemove.forEach(veh => closeVehicles.delete(veh));
  }, 1);
};

const stopStancingThread = () => {
  if (stancingThread === null) return;
  clearInterval(stancingThread);
  stancingThread = null;
};

export const getAppliedStance = (veh: number): Stance.Data => {
  return {
    frontLeft: Math.abs(roundOffset(GetVehicleWheelXOffset(veh, 0))),
    frontRight: Math.abs(roundOffset(GetVehicleWheelXOffset(veh, 1))),
    backLeft: Math.abs(roundOffset(GetVehicleWheelXOffset(veh, 2))),
    backRight: Math.abs(roundOffset(GetVehicleWheelXOffset(veh, 3))),
  };
};

export const updateInfoNotif = (text: string) => {
  removeInfoNotif();
  Notifications.add(text, 'info', undefined, true, NOTIFICATION_ID);
};

export const removeInfoNotif = () => Notifications.remove(NOTIFICATION_ID);

export const roundOffset = (offset: number) => Math.round(offset * 200) / 200;

export const applyModelStance = (
  veh: number,
  comp: string,
  value: number,
  modelData: Stance.Model[],
  originalStance: Stance.Data
) => {
  const newStance = modelData.find(d => d.component === comp && d.value === value)?.stance;
  Entity(veh).state.set('stance', newStance ?? originalStance, true);
};
