import { Jobs, Notifications, SQL, Util } from '@dgx/server';
import { getConfig } from 'helpers/config';
import accountManager from 'modules/bank/classes/AccountManager';
import { paycheckLogger } from './util';

const paycheckCache: Map<number, number> = new Map();
const paycheckIntervals: Map<number, { job: string; amount: number }> = new Map();

const saveToDb = async (cid: number) => {
  const amount = paycheckCache.get(cid);
  const query = `
		INSERT INTO player_paycheck
			(cid, amount)
		VALUES (?, ?)
		ON DUPLICATE KEY UPDATE amount = ?
	`;
  await SQL.query(query, [cid, amount, amount]);
};

export const seedPlyInCache = async (cid: number) => {
  const query = `
		SELECT amount
		FROM player_paycheck
		WHERE cid = ?
	`;
  const result = await SQL.query(query, [cid]);
  if (result == undefined || result.length == 0) {
    paycheckLogger.info(`No paycheck data found for ${cid}`);
    return;
  }
  const amount = result[0].amount;
  paycheckCache.set(cid, amount);
  paycheckLogger.info(`Seeded paycheck cache for ${cid} with ${amount}`);
};

export const seedCache = async () => {
  paycheckCache.clear();

  (
    Object.values({
      ...DGCore.Functions.GetQBPlayers(),
    }) as Player[]
  ).forEach(async (ply: Player) => {
    await seedPlyInCache(ply.PlayerData.citizenid);
    const plyJob = Jobs.getCurrentJob(ply.PlayerData.source);
    checkInterval(ply.PlayerData.citizenid, plyJob);
  });
};

export const registerPaycheck = (cid: number, amount: number, job: string, comment?: string) => {
  const newPaycheck = (paycheckCache.get(cid) ?? 0) + amount;
  paycheckCache.set(cid, newPaycheck);

  const plyId = DGCore.Functions.getPlyIdForCid(cid);
  const plyName = plyId != undefined ? Util.getName(plyId) : 'Unknown';
  Util.Log(
    'financials:paycheck:registered',
    {
      cid,
      amount,
      job,
      comment,
    },
    `${plyName} (${cid}) registered a paycheck of ${amount} for ${job} (${comment})`,
    plyId
  );
  saveToDb(cid);
};

export const givePaycheck = async (src: number) => {
  const cid = Util.getCID(src);
  const logName = Util.getName(src);

  const paycheckAmount = paycheckCache.get(cid);
  if (paycheckAmount === undefined) {
    Notifications.add(src, 'Je hebt geen paycheck', 'error');
    paycheckLogger.debug(`${Util.getName(src)} (${cid}) tried to get his/her paycheck, but they don't have one`);
    return;
  }

  if (paycheckAmount <= 0) {
    Notifications.add(src, 'Je hebt geen paycheck', 'error');
    paycheckLogger.debug(`${Util.getName(src)} (${cid}) tried to get his/her paycheck, but they value was negative`);
    return;
  }

  const account = accountManager.getDefaultAccount(cid);
  if (account === undefined) {
    Notifications.add(src, 'Je hebt geen paycheck', 'error');
    Util.Log(
      'financials:paycheck:error',
      {
        cid,
        amount: paycheckAmount,
      },
      `${logName} (${cid}) attempted to give a paycheck of €${paycheckAmount} but no default account was found.`,
      src,
      true
    );
    paycheckLogger.warn(
      `${logName} (${cid}) attempted to give a paycheck of €${paycheckAmount} but no default account was found.`
    );
    return;
  }

  const result = account.paycheck(cid, paycheckAmount);
  if (!result) {
    Notifications.add(src, 'Konden geen paycheck uitbetalen', 'error');
    Util.Log(
      'financials:paycheck:error',
      {
        cid,
        amount: paycheckAmount,
      },
      `${logName} (${cid}) attempted to give a paycheck of €${paycheckAmount} but the paycheck failed.`,
      src
    );
    paycheckLogger.warn(
      `${logName} (${cid}) attempted to give a paycheck of €${paycheckAmount} but the paycheck failed.`
    );
    return;
  }
  Notifications.add(src, `Paycheck van €${paycheckAmount} uitbetaald.`);
  paycheckLogger.info(`${logName} (${cid}) received his/her paycheck of €${paycheckAmount}`);
  paycheckCache.set(cid, 0);
  saveToDb(cid);
};

export const checkInterval = (cid: number, job: string | null) => {
  if (paycheckIntervals.has(cid)) {
    // Went offduty or changed jobs
    const intervalInfo = paycheckIntervals.get(cid)!;
    if (intervalInfo.job !== job) {
      registerPaycheck(cid, intervalInfo.amount, intervalInfo.job, 'Whitelisted paycheck');
      paycheckIntervals.delete(cid);
      paycheckLogger.debug(`Cleared paycheck interval for ${cid}`);
    }
  }

  const paycheckConfig = getConfig().paycheck;
  if (job !== null && paycheckConfig[job]) {
    const paycheckAmount = paycheckConfig[job];

    paycheckIntervals.set(cid, { job, amount: 0 });
    paycheckLogger.debug(`Registered paycheck interval for ${cid} | job: ${job}`);

    const interval = setInterval(() => {
      const intervalInfo = paycheckIntervals.get(cid);
      if (intervalInfo === undefined || intervalInfo.job !== job) {
        paycheckLogger.error(`Unregistered interval running for ${cid}. Clearing interval.`);
        clearInterval(interval);
        return;
      }
      intervalInfo.amount += paycheckAmount;
      paycheckIntervals.set(cid, intervalInfo);
      paycheckLogger.silly(`Scheduled paycheck for ${cid} of ${paycheckAmount} | job: ${job}`);
    }, 60000);
  }
};
