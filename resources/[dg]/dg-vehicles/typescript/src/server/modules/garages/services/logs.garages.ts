import { getVehicleLog, insertVehicleParkLog } from 'db/repository';

const garageLogs = new Map<string, Garage.ParkLog[]>();

export const getVehicleGarageLog = async (vin: string) => {
  let logs = garageLogs.get(vin);
  if (!logs || logs.length < 30) {
    const newLogs = await getVehicleLog(vin);
    logs = [...(logs ?? []), ...newLogs.reverse()];
    garageLogs.set(vin, logs);
  }

  return logs;
};

export const addVehicleGarageLog = (
  vin: string,
  cid: number,
  isStoring: boolean,
  fuelLevel: number,
  serviceStatus: Service.Status
) => {
  const action: Garage.ParkLog['action'] = isStoring ? 'parked' : 'retrieved';

  const averageServiceStatus = Object.values(serviceStatus).reduce((acc, v) => Math.round(acc + v / 40), 0);
  const stringifiedState = `Status: ${averageServiceStatus}% | Fuel: ${Math.round(fuelLevel)}%`;

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
