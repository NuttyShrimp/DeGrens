import { Notifications } from '@dgx/client';
import { NOTIFICATION_ID } from './constants.stances';

const closeVehicles: Map<number, Stance.Data> = new Map();
let stancingThread: NodeJS.Timer | null = null;

export const handleStanceStateUpdate = (netId: number, stanceData: Stance.Data | null) => {
  // handler fires before entity exists for client. This handler is used for current vehicle only so we dont need to await
  if (!NetworkDoesNetworkIdExist(netId) || !NetworkDoesEntityExistWithNetworkId(netId)) return false;
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (!DoesEntityExist(veh)) return false;

  setCloseVehicleStance(veh, stanceData);
  return true;
};

export const setCloseVehicleStance = (vehicle: number, stanceData: Stance.Data | null) => {
  if (!stanceData) {
    closeVehicles.delete(vehicle);
    return;
  }

  closeVehicles.set(vehicle, stanceData);

  if (closeVehicles.size !== 0) {
    startStancingThread();
  }
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

      SetVehicleWheelXOffset(veh, 0, -stance.frontLeft);
      SetVehicleWheelXOffset(veh, 1, stance.frontRight);
      SetVehicleWheelXOffset(veh, 2, -stance.backLeft);
      SetVehicleWheelXOffset(veh, 3, stance.backRight);
    });

    vehToRemove.forEach(veh => closeVehicles.delete(veh));

    if (closeVehicles.size === 0) {
      stopStancingThread();
    }
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
