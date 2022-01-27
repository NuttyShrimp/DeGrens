import { mainLogger } from '../../../sv_logger';
import { config } from '../../../config';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'; // dependent on utc plugin
import toObject from 'dayjs/plugin/toObject';
import 'dayjs/locale/nl-be';
import debtManager from '../classes/debtmanager';

dayjs.extend(toObject);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('nl-be');
dayjs.utc();

export const debtLogger = mainLogger.child({
	module: 'debts',
	category: 'debts',
});

export const scheduleMaintenanceFees = async () => {
	const maintenceConfig = config.debts.maintenance;
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
	const logs = await global.exports.oxmysql.executeSync(`
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
	const extDate = dayjs(debt.date).add(config.debts.finePayTerm, 'day');
	const secDiff = dayjs().diff(extDate, 'millisecond');
	if (secDiff < 0) {
		debtLogger.debug(`Debt ${debtId} is overdue`);
		debtManager.payOverdueDebt(debtId);
		return;
	}
	debtLogger.silly(`Schedule debt ${debtId} at ${extDate.format('DD/MM/YYYY HH:mm')} for ${secDiff} milliseconds`);
	setTimeout(() => {
		const debt = debtManager.getDebtById(debtId);
		// is already paid
		if (!debt) return;
		debtLogger.debug(`Debt ${debtId} is overdue`);
		debtManager.payOverdueDebt(debtId);
	}, secDiff);
};

// Calculate the maintenance fees for all assets, multiplier is used in case of a calc for mulitple days is needed
export const calculateMaintenceFees = (multiplier = 1) => {
	// TODO - implement	when vehicles and housing are implemented
	console.log(multiplier);
	global.exports.oxmysql.executeSync(`
		INSERT INTO maintenance_fee_log (date)
		VALUES (NOW());
	`);
};
