import { Notifications, SQL, Util } from '@dgx/server';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // dependent on utc plugin
import toObject from 'dayjs/plugin/toObject';
import utc from 'dayjs/plugin/utc';
import { getConfigModule } from 'helpers/config';

import 'dayjs/locale/nl-be';

import debtManager from '../classes/debtmanager';

import { debtLogger } from './debts';

dayjs.extend(toObject);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('nl-be');
dayjs.utc();

export const scheduleMaintenanceFees = async () => {
  const maintenceConfig = (await getConfigModule('debts')).maintenance;
  const now = dayjs();
  const schedule = dayjs().add(1, 'day').set('hour', maintenceConfig.hour).set('minute', maintenceConfig.minute);
  debtLogger.info(
    `Maintenance fee check scheduled at ${schedule.format('DD/MM/YYYY HH:mm')} in ${schedule.diff(now, 'hours')} hours`
  );
  setTimeout(() => {
    debtLogger.info('Starting maintenance fee check');
    calculateMaintenceFees();
  }, schedule.diff(now));
  // Check for missed ones
  const logs = await SQL.query(`
		SELECT *
		FROM maintenance_fee_log
		ORDER BY id DESC
		LIMIT 1
	`);
  if (logs.length > 0) {
    const lastLog = logs[0];
    const lastLogDate = dayjs(lastLog.date);
    const diff = now.diff(lastLogDate, 'days');
    if (diff > 1) {
      debtLogger.warn(`Last maintenance fee check was ${diff} days ago, checking again`);
      calculateMaintenceFees(diff);
    }
  }
};

// Calculate the maintenance fees for all assets, multiplier is used in case of a calc for mulitple days is needed
export const calculateMaintenceFees = (multiplier = 1) => {
  // TODO - implement when vehicles and housing are implemented
  // TODO - remove old maintenance fees before sending new
  // should be 1 fee per asset
  console.log(multiplier);
  SQL.query(`
    INSERT INTO maintenance_fee_log (date)
    VALUES (NOW());
  `);
};

export const removeMaintenanceFees = async (src: number) => {
  const cid = Util.getCID(src);
  const debts = debtManager.getDebtsByCid(cid);
  const mainFees = debts.filter(d => d.type === 'maintenance').map(f => f.id);
  await debtManager.removeDebts(mainFees);
  Notifications.add(src, 'Succesfully removed maintenance fees', 'success');
  debtLogger.info(`Removed all maintenance fees for ${GetPlayerName(String(src))} (${src}|${cid})`);
  Util.Log('financials:debts:removeMaintenanceFees', {}, `Tried to removed maintenance for ${src}`, src);
};
