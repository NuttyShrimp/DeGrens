import { SQL } from '@dgx/server';

import vinManager from '../../identification/classes/vinmanager';
import { mainLogger } from '../../../sv_logger';
import { DEFAULT_SERVICE_STATUS } from '../constants.status';
import { getPartRepairAmount } from '../service.status';

const localStore: Map<string, Service.Status> = new Map();
const DBStore: Map<string, Service.Status> = new Map();

export const seedServiceStatuses = async () => {
  const results = await SQL.query<(Service.Status & { vin: string })[]>('SELECT * FROM vehicle_service_status');
  results.forEach(status => {
    const { vin, ...stateWithoutVin } = status;
    DBStore.set(String(vin), { ...stateWithoutVin } satisfies Service.Status);
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
  if (!status) {
    mainLogger.warn(`Failed to update status for ${vin} because status was ${status}`);
    return;
  }

  // clamp values
  for (const key in status) {
    status[key as keyof Service.Status] = Math.max(0, Math.min(1000, status[key as keyof Service.Status]));
  }

  if (vinManager.isVinFromPlayerVeh(vin)) {
    DBStore.set(vin, status);
    updateDBStatus(vin);
  } else {
    localStore.set(vin, status);
  }
};

export const getServiceStatus = (vin: string | null): Service.Status => {
  if (!vin) return { ...DEFAULT_SERVICE_STATUS };

  if (DBStore.has(vin)) return DBStore.get(vin)!;
  if (localStore.has(vin)) return localStore.get(vin)!;

  const newStatus = { ...DEFAULT_SERVICE_STATUS };
  if (vinManager.isVinFromPlayerVeh(vin)) {
    DBStore.set(vin, newStatus);
    insertDBStatus(vin);
  } else {
    localStore.set(vin, newStatus);
  }

  return newStatus;
};
