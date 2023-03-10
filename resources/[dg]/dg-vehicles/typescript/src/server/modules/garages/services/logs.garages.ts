import { getVehicleLog, insertVehicleParkLog } from 'db/repository';

const garageLogs = new Map<string, SVGarage.Log[]>();

export const getVehicleGarageLog = async (vin: string) => {
  let logs = garageLogs.get(vin);
  if (!logs) {
    const newLogs = await getVehicleLog(vin);
    logs = [...newLogs.reverse()];
    garageLogs.set(vin, logs);
  }

  return logs;
};

export const addVehicleGarageLog = (vin: string, cid: number, isStoring: boolean, state: Vehicle.VehicleStatus) => {
  const action: SVGarage.Log['action'] = isStoring ? 'parked' : 'retrieved';
  const stringifiedState = `Engine: ${Math.round(state.engine / 10)}% | Body: ${Math.round(
    state.body / 10
  )}% | Fuel: ${Math.round(state.fuel)}%`;

  const newLog = {
    cid,
    action,
    state: stringifiedState,
  };

  insertVehicleParkLog(vin, cid, action, stringifiedState);

  const logs = garageLogs.get(vin);
  if (logs) {
    logs.unshift(newLog);
  } else {
    garageLogs.set(vin, [newLog]);
  }
};
