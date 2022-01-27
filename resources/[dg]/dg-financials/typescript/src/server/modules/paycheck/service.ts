import { paycheckLogger } from './util';
import { config } from '../../config';
import { cashLogger } from '../cash/util';
import { getDefaultAccountId } from '../bank/helpers/accounts';
import { paycheck } from '../bank/helpers/actions';

const paycheckCache: Map<string, number> = new Map();
const paycheckIntervals: Map<string, { job: string; interval: NodeJS.Timer; amount: number }> = new Map();

const saveToDb = async (cid: string) => {
	const amount = paycheckCache.get(cid);
	const query = `
		INSERT INTO player_paycheck
			(cid, amount)
		VALUES (?, ?)
		ON DUPLICATE KEY UPDATE amount = ?
	`;
	await global.exports.oxmysql.executeSync(query, [cid, amount, amount]);
};

export const seedPlyInCache = async (src: number) => {
	const Player = DGCore.Functions.GetPlayer(src);
	const cid = Player.PlayerData.citizenid;
	const query = `
		SELECT amount
		FROM player_paycheck
		WHERE cid = ?
	`;
	const result = await global.exports.oxmysql.executeSync(query, [cid]);
	if (result == undefined || result.length == 0) {
		paycheckLogger.info(`No paycheck data found for ${cid}`);
		return;
	}
	paycheckCache.set(cid, result[0].amount);
	paycheckLogger.info(`Seeded paycheck cache for ${cid} with ${paycheckCache.get(cid)}`);
};

export const seedCache = () => {
	paycheckCache.clear();
	DGCore.Functions.GetPlayers().forEach(player => {
		seedPlyInCache(player);
		const Player = DGCore.Functions.GetPlayer(player);
		checkInterval(Player.PlayerData.citizenid, Player.PlayerData.job.name, Player.PlayerData.job.onduty);
	});
};

export const registerPaycheck = (src: number, amount: number, job: string, comment?: string) => {
	const Player = DGCore.Functions.GetPlayer(src);
	const cid = Player.PlayerData.citizenid;
	if (paycheckCache.has(cid)) {
		paycheckCache.set(cid, paycheckCache.get(cid) + amount);
	} else {
		paycheckCache.set(cid, amount);
	}
	global.exports['dg-logs'].createGraylogEntry(
		'financials:paycheckRegistered',
		{
			cid,
			amount,
			job,
			comment,
		},
		`${Player.PlayerData.name} (${Player.PlayerData.citizenid}) registered a paycheck of ${amount} for ${job} (${comment})`
	);
	saveToDb(cid);
};

export const givePaycheck = async (src: number) => {
	const Player = DGCore.Functions.GetPlayer(src);
	const cid = Player.PlayerData.citizenid;
	if (!paycheckCache.has(cid)) {
		emitNet('DGCore:Notify', src, 'Je hebt geen paycheck.', 'error');
		paycheckLogger.debug(
			`${Player.PlayerData.name} (${Player.PlayerData.citizenid}) tried to get his/her paycheck, but they don't have one`
		);
		return;
	}
	const paycheckAmount = paycheckCache.get(cid);
	if (paycheckAmount <= 0) {
		emitNet('DGCore:Notify', src, 'Je hebt geen paycheck.', 'error');
		paycheckLogger.debug(
			`${Player.PlayerData.name} (${Player.PlayerData.citizenid}) tried to get his/her paycheck, but they value was negative`
		);
		return;
	}
	const accountId = await getDefaultAccountId(cid);
	if (accountId == undefined) {
		emitNet('DGCore:Notify', src, 'Je hebt geen paycheck.', 'error');
		global.exports['dg-logs'].createGraylogEntry(
			'financials:paycheckError',
			{
				cid,
				amount: paycheckAmount,
			},
			`${Player.PlayerData.name} (${Player.PlayerData.citizenid}) attempted to give a paycheck of €${paycheckAmount} but no default account was found.`,
			true
		);
		cashLogger.warn(
			`${Player.PlayerData.name} (${Player.PlayerData.citizenid}) attempted to give a paycheck of €${paycheckAmount} but no default account was found.`
		);
		return;
	}
	const result = paycheck(accountId, cid, paycheckAmount);
	if (!result) {
		emitNet('DGCore:Notify', src, 'Konden geen paycheck uitbetalen.', 'error');
		global.exports['dg-logs'].createGraylogEntry(
			'financials:paycheckError',
			{
				cid,
				amount: paycheckAmount,
			},
			`${Player.PlayerData.name} (${Player.PlayerData.citizenid}) attempted to give a paycheck of €${paycheckAmount} but the paycheck failed.`
		);
		cashLogger.warn(
			`${Player.PlayerData.name} (${Player.PlayerData.citizenid}) attempted to give a paycheck of €${paycheckAmount} but the paycheck failed.`
		);
		return;
	}
	emitNet('DGCore:Notify', src, `Paycheck van €${paycheckAmount} uitbetaald.`);
	paycheckLogger.info(
		`${Player.PlayerData.name} (${Player.PlayerData.citizenid}) received his/her paycheck of €${paycheckAmount}`
	);
	paycheckCache.set(cid, 0);
	saveToDb(cid);
};

export const checkInterval = (cid: string, job: string, onDuty: boolean) => {
	if (paycheckIntervals.has(cid)) {
		const intervalInfo = paycheckIntervals.get(cid);
		// Went offduty or changed jobs
		if (intervalInfo.job != job || !onDuty) {
			const Player = DGCore.Functions.GetPlayerByCitizenId(cid);
			registerPaycheck(Player.PlayerData.source, intervalInfo.amount, job, 'Whitelisted paycheck');
			clearInterval(intervalInfo.interval);
			paycheckIntervals.delete(cid);
			paycheckLogger.debug(`Cleared paycheck interval for ${cid}`);
		}
	}
	if (config.paycheck.whitelisted[job] && onDuty) {
		const paycheckAmount = config.paycheck.whitelisted[job];
		const interval = setInterval(() => {
			if (!paycheckIntervals.has(cid)) {
				paycheckLogger.error(`Unregistered interval running for ${cid}. Clearing interval.`);
				clearInterval(interval);
			}
			const intervalInfo = paycheckIntervals.get(cid);
			intervalInfo.amount += paycheckAmount;
			paycheckIntervals.set(cid, intervalInfo);
			paycheckLogger.silly(`Scheduled paycheck for ${cid} of ${paycheckAmount} | job: ${job}`);
		}, 60000);
		paycheckIntervals.set(cid, { job, interval, amount: 0 });
		paycheckLogger.debug(`Registered paycheck interval for ${cid} | job: ${job}`);
	}
};
