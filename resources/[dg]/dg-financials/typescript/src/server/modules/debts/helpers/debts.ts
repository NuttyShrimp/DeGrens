import { Notifications, SQL, Util } from '@dgx/server';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // dependent on utc plugin
import toObject from 'dayjs/plugin/toObject';
import utc from 'dayjs/plugin/utc';
import { getConfigModule } from 'helpers/config';

import 'dayjs/locale/nl-be';

import { mainLogger } from '../../../sv_logger';
import debtManager from '../classes/debtmanager';

dayjs.extend(toObject);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('nl-be');
dayjs.utc();

const scheduledDebts = new Map<number, NodeJS.Timeout>();

export const debtLogger = mainLogger.child({
  module: 'debts',
  category: 'debts',
});

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

export const scheduleDebt = (debtId: number) => {
  const debt = debtManager.getDebtById(debtId);
  if (!debt) {
    debtLogger.error(`Debt with id ${debtId} not found`);
    return;
  }
  const extDate = dayjs(debt.date).add(debtManager.getConfig().finePayTerm, 'day');
  const secDiff = dayjs().diff(extDate, 'millisecond');
  if (secDiff < 0) {
    debtLogger.debug(`Debt ${debtId} is overdue`);
    debtManager.payOverdueDebt(debtId);
    return;
  }
  debtLogger.silly(`Schedule debt ${debtId} at ${extDate.format('DD/MM/YYYY HH:mm')} for ${secDiff} milliseconds`);
  if (scheduledDebts.has(debtId)) {
    clearTimeout(scheduledDebts.get(debtId));
    scheduledDebts.delete(debtId);
  }
  const timeout = setTimeout(() => {
    const debt = debtManager.getDebtById(debtId);
    // is already paid
    if (!debt) return;
    debtLogger.debug(`Debt ${debtId} is overdue`);
    debtManager.payOverdueDebt(debtId);
    if (scheduledDebts.has(debtId)) {
      scheduledDebts.delete(debtId);
    }
  }, secDiff);
  scheduledDebts.set(debtId, timeout);
};

export const unscheduleDebt = (debtId: number) => {
  if (scheduledDebts.has(debtId)) {
    scheduledDebts.delete(debtId);
  }
  debtLogger.silly(`Schedule for debt ${debtId} has been removed`);
};

// Calculate the maintenance fees for all assets, multiplier is used in case of a calc for mulitple days is needed
export const calculateMaintenceFees = (multiplier = 1) => {
  // TODO - implement	when vehicles and housing are implemented
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
