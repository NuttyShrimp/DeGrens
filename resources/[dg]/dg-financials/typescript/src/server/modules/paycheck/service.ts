import { Jobs, Notifications, SQL, Util } from '@dgx/server';
import { getConfig } from 'helpers/config';
import accountManager from 'modules/bank/classes/AccountManager';
import { paycheckLogger } from './util';

const paycheckCache: Map<number, number> = new Map();

export const seedPlyInCache = async (cid: number) => {
  const query = `
		SELECT amount
		FROM player_paycheck
		WHERE cid = ?
	`;
  const result = await SQL.query<{ amount: number }[]>(query, [cid]);
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

  (Object.values(DGCore.Functions.GetQBPlayers()) as Player[]).forEach(ply => {
    seedPlyInCache(ply.PlayerData.citizenid);
  });
};

export const addAmountToPaycheck = (cid: number, amount: number, comment: string) => {
  const plyTotalPaycheck = (paycheckCache.get(cid) ?? 0) + amount;

  paycheckCache.set(cid, plyTotalPaycheck);
  updateDBPaycheck(cid, plyTotalPaycheck);

  const plyId = DGCore.Functions.getPlyIdForCid(cid);
  const plyName = plyId != undefined ? Util.getName(plyId) : 'Unknown';
  Util.Log(
    'financials:paycheck:add',
    {
      cid,
      amount,
      comment,
    },
    `${amount} got added to paycheck of ${plyName} - ${cid} (${comment})`,
    plyId
  );
};

const updateDBPaycheck = async (cid: number, amount: number) => {
  const query = `
		INSERT INTO player_paycheck
			(cid, amount)
		VALUES (?, ?)
		ON DUPLICATE KEY UPDATE amount = VALUES(amount)
	`;
  await SQL.query(query, [cid, amount]);
};

export const givePaycheck = async (src: number) => {
  const cid = Util.getCID(src);
  const logName = Util.getName(src);

  const paycheckAmount = paycheckCache.get(cid) ?? 0;
  if (paycheckAmount <= 0) {
    Notifications.add(src, 'Je hebt geen paycheck', 'error');
    paycheckLogger.debug(`${logName} (${cid}) tried to get his/her paycheck, but they value was negative or zero`);
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

  const payedOutPrice = await account.paycheck(cid, paycheckAmount);
  if (!payedOutPrice) {
    Notifications.add(src, 'Kon geen paycheck uitbetalen', 'error');
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
  Notifications.add(src, `Paycheck van €${payedOutPrice} uitbetaald.`);
  paycheckLogger.info(
    `${logName} (${cid}) received his/her paycheck of €${payedOutPrice} (Without tax: ${paycheckAmount})`
  );

  paycheckCache.set(cid, 0);
  updateDBPaycheck(cid, 0);
};

export const startPaycheckInterval = () => {
  const paycheckConfig = getConfig().paycheck;

  setInterval(() => {
    const queryParams: number[] = [];

    // this only gets plys with active characters compared to Util.getAllPlayers
    const players = Object.values(DGCore.Functions.GetQBPlayers()) as Player[];
    if (players.length === 0) return;

    for (const player of players) {
      const job = String(Jobs.getCurrentJob(player.PlayerData.source));
      const amount = paycheckConfig[job] ?? 0;
      const plyTotalPaycheck = (paycheckCache.get(player.PlayerData.citizenid) ?? 0) + amount;

      paycheckCache.set(player.PlayerData.citizenid, plyTotalPaycheck);
      queryParams.push(player.PlayerData.citizenid, plyTotalPaycheck);
    }

    SQL.query(
      `INSERT INTO player_paycheck (cid, amount) VALUES ${[...new Array(players.length)]
        .fill('(?, ?)')
        .join(', ')} ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      queryParams
    );

    paycheckLogger.debug(`Updated paycheck for ${players.length} players`);
  }, 60 * 1000);
};
