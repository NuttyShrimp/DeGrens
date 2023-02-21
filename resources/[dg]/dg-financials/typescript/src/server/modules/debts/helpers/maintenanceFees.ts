import { Notifications, SQL, Util } from '@dgx/server';
import dayjs from 'dayjs';
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
  const next_cycle = last_date
    .add(maintenceConfig.daysBetween, 'day')
    .set('hour', maintenceConfig.hour)
    .set('minute', maintenceConfig.minute);

  debtLogger.info(
    `Maintenance fee check scheduled at ${next_cycle.format('DD/MM/YYYY HH:mm')} in ${next_cycle.diff(
      now,
      'hours'
    )} hours`
  );
  if (next_cycle.diff(now, 'h') > 12) return;

  if (next_cycle.isBefore(now)) {
    // rebuild missing logs + calc now
    const missedDays = now.diff(last_date, 'day');
    const missedLogs = Math.floor(missedDays / 21);
    const new_last = last_date.add(missedLogs, 'day');
    SQL.query('INSERT INTO maintenance_fee_log (date) VALUES (FROM_UNIXTIME(?))', [new_last.unix()]);
    calculateMaintenceFees();
    scheduleMaintenanceFees();
    return;
  }

  setTimeout(() => {
    debtLogger.info('Starting maintenance fee check');
    calculateMaintenceFees();
  }, next_cycle.diff(now));
};

// Calculate the maintenance fees for all assets, multiplier is used in case of a calc for mulitple days is needed
export const calculateMaintenceFees = async () => {
  // TODO - implement when vehicles and housing are implemented
  const allCidsStructs = await SQL.query<{ citizenid: number }[]>('SELECT citizenid FROM characters');
  const allCids = allCidsStructs.map(ac => ac.citizenid);
  global.exports['dg-vehicles'].generateFees(allCids);
  // TODO - remove old maintenance fees before sending new
  // should be 1 fee per asset
  SQL.query(`
    INSERT INTO maintenance_fee_log (date)
    VALUES (NOW());
  `);
};

RegisterCommand(
  'vehicles:maintenanceFees',
  () => {
    calculateMaintenceFees();
  },
  false
);

export const removeMaintenanceFees = async (src: number) => {
  const cid = Util.getCID(src);
  const debts = debtManager.getDebtsByCid(cid);
  const mainFees = debts.filter(d => d.type === 'maintenance').map(f => f.id);
  await debtManager.removeDebts(mainFees);
  Notifications.add(src, 'Succesfully removed maintenance fees', 'success');
  debtLogger.info(`Removed all maintenance fees for ${GetPlayerName(String(src))} (${src}|${cid})`);
  Util.Log('financials:debts:removeMaintenanceFees', {}, `Tried to removed maintenance for ${src}`, src);
};
