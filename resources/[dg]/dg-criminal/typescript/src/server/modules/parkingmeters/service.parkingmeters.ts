import { Events, Financials, Inventory, Notifications, Police, Util } from '@dgx/server';
import config from 'services/config';
import { Vector3 } from '@dgx/shared';

const plyToParkingMeterCoords = new Map<number, Vec3>();
const lootedParkingMeters: Vec3[] = [];

export const dispatchParkingMeterModelsToClient = (plyId: number) => {
  Events.emitNet('criminal:parkingmeters:registerPeekOptions', plyId, config.parkingmeters.models);
};

export const startLootingParkingMeter = (plyId: number, coords: Vec3): boolean => {
  if (plyToParkingMeterCoords.has(plyId)) {
    Notifications.add(plyId, 'Je bent nog een parkingmeter aan het openbreken', 'error');
    return false;
  }

  const vecCoords = Vector3.create(coords);
  if (lootedParkingMeters.some(c => vecCoords.distance(c) < 1)) {
    return false;
  }

  plyToParkingMeterCoords.set(plyId, coords);
  lootedParkingMeters.push(coords);

  if (Math.random() < config.parkingmeters.policeCallChance) {
    Police.createDispatchCall({
      title: 'Openbreken Parkeermeter',
      description: 'Een voetganger meld dat er iemand een parkeermeter aan het openbreken is.',
      coords,
      tag: '10-62',
    });
  }

  return true;
};

export const finishLootingParkingMeter = async (plyId: number, success: boolean) => {
  const coords = plyToParkingMeterCoords.get(plyId);
  if (!coords) return;

  plyToParkingMeterCoords.delete(plyId);

  const lockpickItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'lockpick');
  if (lockpickItem) {
    Inventory.setQualityOfItem(lockpickItem.id, old => old - (config.parkingmeters.lockpickQualityDecrease ?? 0));
  }

  if (!success) {
    const vecCoords = Vector3.create(coords);
    const meterIdx = lootedParkingMeters.findIndex(c => vecCoords.distance(c) < 1);
    if (meterIdx !== -1) {
      lootedParkingMeters.splice(meterIdx, 1);
    }
    return;
  }

  if (!lockpickItem) {
    Notifications.add(plyId, 'Je hebt geen lockpick', 'error');
    return;
  }

  const [minCash, maxCash] = config.parkingmeters.loot;
  const cashAmount = Util.getRndInteger(minCash, maxCash + 1);
  Financials.addCash(plyId, cashAmount, 'parkingmeter_robbery');

  Util.Log(
    'criminal:parkingmeters:loot',
    {
      cashAmount,
      coords,
    },
    `${Util.getName(plyId)}(${plyId}) has looted a parking meter`,
    plyId
  );
};
