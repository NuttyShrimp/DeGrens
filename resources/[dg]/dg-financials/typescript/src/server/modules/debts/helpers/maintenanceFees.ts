import { Notifications, SQL, Util } from '@dgx/server';
import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // dependent on utc plugin
import toObject from 'dayjs/plugin/toObject';
import utc from 'dayjs/plugin/utc';

import 'dayjs/locale/nl-be';

import debtManager from '../classes/debtmanager';

import { debtLogger } from './debts';
import { getConfig } from 'helpers/config';

dayjs.extend(toObject);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('nl-be');
dayjs.utc();

let maintenanceSchedule: Dayjs;

export const isMaintenanceFeesInWeekOrLess = () => {
  return maintenanceSchedule.isBefore(dayjs().add(7, "d"));
}

export const getMaintenanceFeeSchedule = () => {
  return maintenanceSchedule;
}

export const scheduleMaintenanceFees = async () => {
  const maintenceConfig = getConfig().debts.maintenance;
  // if (Util.isDevEnv()) return;

  // get last logs
  const last_logs = await SQL.query<DB.IMaintenanceLog[]>(
    'SELECT id, UNIX_TIMESTAMP(date) as date FROM maintenance_fee_log ORDER BY id DESC LIMIT 1'
  );
  if (last_logs.length === 0) {
    // First time starting up server, not fucking every one
    await SQL.query('INSERT INTO maintenance_fee_log (date) VALUES (NOW())');
    // recursion bcs i'm lazy
    await scheduleMaintenanceFees();
    return;
  }
  const last_log = last_logs[0];

  const last_date = dayjs.unix(last_log.date);
  const now = dayjs();
  maintenanceSchedule = last_date
    .add(maintenceConfig.daysBetween, 'day')
    .set('hour', maintenceConfig.hour)
    .set('minute', maintenceConfig.minute);

  debtLogger.info(
    `Maintenance fee check scheduled at ${maintenanceSchedule.format('DD/MM/YYYY HH:mm')} in ${maintenanceSchedule.diff(
      now,
      'hours'
    )} hours`
  );
  if (maintenanceSchedule.diff(now, 'h') > 12) return;

  if (maintenanceSchedule.isBefore(now)) {
    // rebuild missing logs + calc now
    const missedDays = now.diff(last_date, 'day');
    const missedLogs = Math.floor(missedDays / 21);
    const new_last = last_date.add(missedLogs, 'day');
    SQL.query('INSERT INTO maintenance_fee_log (date) VALUES (FROM_UNIXTIME(?))', [new_last.unix()]);
    registerMaintenanceFees();
    scheduleMaintenanceFees();
    return;
  }

  setTimeout(() => {
    debtLogger.info('Starting maintenance fee check');
    registerMaintenanceFees();
  }, maintenanceSchedule.diff(now));
};

// Calculate the maintenance fees for all assets, multiplier is used in case of a calc for mulitple days is needed
export const calculateMaintenceFees = async (cids?: number[]) => {
  if (!cids) {
    const allCidsStructs = await SQL.query<{ citizenid: number }[]>('SELECT citizenid FROM characters');
    cids = allCidsStructs.map(ac => ac.citizenid);
  }

  const fees: IFinancials.MaintenanceFee[] = await global.exports['dg-vehicles'].generateFees(cids);

  return fees
};

const registerMaintenanceFees = async () => {
  await Util.Delay(90000); // Wait 1.5 minutes to make sure we are not around a restart point, tx has a 1 minute clearance time after the restart time
  const fees = await calculateMaintenceFees();

  // Check if fees for debts[].reason exist
  const feeIds = await SQL.query("SELECT id FROM debts WHERE reason IN (?)", [fees.map(f => f.reason).join(",")]);
  if (feeIds > 0) {
    await debtManager.removeDebts(feeIds)
  }

  await SQL.query(`
    INSERT INTO maintenance_fee_log (date)
    VALUES (NOW());
  `);
}

export const removeMaintenanceFees = async (src: number) => {
  const cid = Util.getCID(src);
  const debts = await debtManager.getDebtsByCid(cid);
  const mainFees = debts.filter(d => d.type === 'maintenance').map(f => f.id);
  await debtManager.removeDebts(mainFees);
  Notifications.add(src, 'Succesfully removed maintenance fees', 'success');
  debtLogger.info(`Removed all maintenance fees for ${GetPlayerName(String(src))} (${src}|${cid})`);
  Util.Log('financials:debts:removeMaintenanceFees', {}, `Tried to removed maintenance for ${src}`, src);
};