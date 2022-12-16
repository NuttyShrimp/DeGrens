import { SQL } from '@dgx/server';

import vinManager from '../../identification/classes/vinmanager';
import { generateServiceStatus } from '../service.status';

const localStore: Map<string, Service.Status> = new Map();
const DBStore: Map<string, Service.Status> = new Map();

export const seedServiceStatuses = async () => {
  const results = await SQL.query<(Service.Status & { vin: string })[]>('SELECT * FROM vehicle_service_status');
  results.forEach(status => {
    const { vin, ...stateWithoutVin } = status;
    DBStore.set(String(vin), { ...stateWithoutVin } as Service.Status);
  });
};

const updateDBStatus = (vin: string) => {
  if (!vin || !DBStore.has(vin)) return;
  const status = DBStore.get(vin)!;
  SQL.query('UPDATE vehicle_service_status SET axle = ?, brakes = ?, engine = ?, suspension = ? WHERE vin = ?', [
    status.axle,
    status.brakes,
    status.engine,
    status.suspension,
    vin,
  ]);
};

const insertDBStatus = (vin: string) => {
  if (!vin || !DBStore.has(vin)) return;
  const status = DBStore.get(vin);
  SQL.insertValues('vehicle_service_status', [
    {
      ...status,
      vin,
    },
  ]);
};

export const updateServiceStatus = (vin: string, status: Service.Status) => {
  if (vinManager.isVinFromPlayerVeh(vin)) {
    DBStore.set(vin, status);
    updateDBStatus(vin);
  } else {
    localStore.set(vin, status);
  }
};

// Modifier is amount in percentage that is added to the part
export const updateServiceStatusPart = (vin: string, part: keyof Service.Status, modifier: number) => {
  const status = getServiceStatus(vin);
  status[part] = Math.min(1000, status[part] * (1 + modifier / 100));
  updateServiceStatus(vin, status);
};

export const getServiceStatus = (vin: string): Service.Status => {
  if (DBStore.has(vin)) {
    return DBStore.get(vin)!;
  }
  if (localStore.has(vin)) {
    return localStore.get(vin)!;
  }
  const newStatus = generateServiceStatus();
  if (vinManager.isVinFromPlayerVeh(vin)) {
    DBStore.set(vin, newStatus);
    insertDBStatus(vin);
  } else {
    localStore.set(vin, newStatus);
  }
  return newStatus;
};
