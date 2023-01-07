import { Events, Notifications, Police, Util } from '@dgx/server';
import { getHospitalConfig } from 'services/config';

const getAvailableBed = () => {
  const beds = [...getHospitalConfig().beds].reverse();
  for (const bed of beds) {
    if (!Util.isAnyPedInRange(bed, 2, true)) {
      return bed;
    }
  }

  return beds[0];
};

const getClosestBed = (plyId: number) => {
  const coords = Util.getPlyCoords(plyId);
  for (const bedPos of getHospitalConfig().beds) {
    const distance = coords.distance(bedPos);
    if (distance < 2) {
      return bedPos;
    }
  }
};

export const sendToClosestBed = (plyId: number) => {
  const bed = getClosestBed(plyId);
  if (!bed) {
    Notifications.add(plyId, 'Hier is geen bed', 'error');
    return;
  }
  sendToBed(plyId, bed, 0);
};

export const sendToAvailableBed = (plyId: number, timeout: number) => {
  const bed = getAvailableBed();
  sendToBed(plyId, bed, timeout);
};

const sendToBed = async (plyId: number, bed: Vec4, timeout: number) => {
  await Police.forceStopInteractions(plyId);
  Events.emitNet('hospital:beds:enter', plyId, bed, timeout);
};
