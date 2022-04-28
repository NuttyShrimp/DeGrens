import { config } from '../../../config';
import { getDefaultAccount, getDefaultAccountId } from '../../bank/helpers/accounts';
import { transfer } from '../../bank/helpers/actions';
import { debtLogger, scheduleDebt } from '../helpers/debts';
import { Notifications, SQL } from '@dgx/server';

class DebtManager {
  private static _instance: DebtManager;

  public static getInstance(): DebtManager {
    if (!DebtManager._instance) {
      DebtManager._instance = new DebtManager();
    }
    return DebtManager._instance;
  }

  private debts: Debts.Debt[];

  constructor() {
    this.debts = [];
    this.seedDebts();
  }

  private async seedDebts() {
    const query = `
			SELECT *,
						 UNIX_TIMESTAMP(date) AS date
			FROM debts d
		`;
    this.debts = await SQL.query(query);
  }

  public async addDebt(
    cid: number,
    target_account: string,
    fine: number,
    reason: string,
    given_by?: number,
    type: Debts.Type = 'debt'
  ) {
    const debt: Debts.Debt = {
      id: 0,
      cid: cid,
      target_account,
      debt: fine,
      type,
      given_by: given_by ?? null,
      reason: reason,
      date: Math.floor(Date.now() / 1000),
    };
    const query = `
			INSERT INTO debts (cid, debt, target_account, type, given_by, reason, date)
			VALUES (?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))
			RETURNING id
		`;
    const result = await SQL.query(query, [
      debt.cid,
      debt.debt,
      debt.target_account,
      debt.type,
      debt.given_by,
      debt.reason,
      debt.date,
    ]);
    if (!result || !result[0]) {
      debtLogger.error(
        `Failed to add debt for ${cid} | cid: ${cid} | target: ${target_account} | fine: ${fine} | reason: ${reason} | given_by: ${given_by} | type: ${type}`
      );
      global.exports['dg-logs'].createGraylogEntry(
        'financials:debt:add:failed',
        debt,
        `Failed to add debt for ${cid} | target: ${target_account} | fine: ${fine} | given_by: ${given_by} | type: ${type}`,
        true
      );
      return;
    }
    debt.id = result[0].id;
    debtLogger.info(
      `Added debt for ${cid} | cid: ${cid} | target: ${target_account} | fine: ${fine} | reason: ${reason} | given_by: ${given_by} | type: ${type}`
    );
    global.exports['dg-logs'].createGraylogEntry(
      'financials:debt:add',
      debt,
      `Added debt for ${cid} | target: ${target_account} | fine: ${fine} | given_by: ${given_by} | type: ${type}`
    );
    this.debts.push(debt);
    scheduleDebt(debt.id);
  }

  public getDebtsByCid(cid: number): Debts.Debt[] {
    return this.debts.filter(debt => debt.cid === cid);
  }

  public getDebtById(id: number): Debts.Debt {
    return this.debts.find(debt => debt.id === id);
  }

  public async payDebt(src: number, id: number): Promise<boolean> {
    const Player = DGCore.Functions.GetPlayer(src);
    if (!Player) {
      debtLogger.error(`payDebt called for unknown player ${src}`);
      return;
    }
    const cid = Player.PlayerData.citizenid;
    const debt = this.getDebtById(id);
    if (!debt) {
      debtLogger.warn(`Failed to pay debt | id: ${id} | cid: ${cid}`);
      global.exports['dg-logs'].createGraylogEntry(
        'financials:debt:pay:failed',
        { id, cid },
        `Failed to pay debt, non existing debt | id: ${id} | cid: ${cid}`
      );
      return;
    }
    if (debt.cid !== cid) {
      debtLogger.warn(`Failed to pay debt | id: ${id} | cid: ${cid}`);
      global.exports['dg-logs'].createGraylogEntry(
        'financials:debt:pay:failed',
        { id, cid, debt },
        `Failed to pay debt, cid didn't match | id: ${id} | cid: ${cid}`
      );
      return;
    }
    const accountId = await getDefaultAccountId(cid);
    if (!accountId) {
      debtLogger.warn(`Failed to pay debt | id: ${id} | cid: ${cid}`);
      global.exports['dg-logs'].createGraylogEntry(
        'financials:debt:pay:failed',
        { id, cid, debt },
        `Failed to pay debt, no default account found | id: ${id} | cid: ${cid}`
      );
      return;
    }
    const success = await transfer(accountId, debt.target_account, debt.given_by ?? cid, cid, debt.debt, debt.reason);
    if (success) {
      global.exports['dg-logs'].createGraylogEntry(
        'financials:debt:pay',
        { id, cid, debt },
        `Successfully paid debt of ${debt.debt} | id: ${id} | cid: ${cid}`
      );
    } else {
      Notifications.add(src, 'Je hebt te weinig geld op je rekening om dit te doen');
    }
    return success;
  }

  public async payOverdueDebt(id: number): Promise<boolean> {
    const debt = this.getDebtById(id);
    if (!debt) {
      debtLogger.warn(`Failed to pay debt | id: ${id}`);
      global.exports['dg-logs'].createGraylogEntry(
        'financials:debt:overduePay:failed',
        { id },
        `Failed to pay debt, non existing debt | id: ${id}`
      );
      return;
    }
    const account = await getDefaultAccount(debt.cid);
    if (!account) {
      debtLogger.warn(`Failed to pay debt | id: ${id} | cid: ${debt.cid}`);
      global.exports['dg-logs'].createGraylogEntry(
        'financials:debt:overduePay:failed',
        { id, cid: debt.cid, debt },
        `Failed to pay debt, no default account found | id: ${id} | debt.cid: ${debt.cid}`
      );
      return;
    }
    const newDebt = debt.debt * (1 + config.debts.fineInterest / 100);
    const success = await account.transfer(
      debt.target_account,
      debt.given_by ?? debt.cid,
      debt.cid,
      newDebt,
      `Overtijd | ${debt.reason}`,
      true
    );
    if (success) {
      global.exports['dg-logs'].createGraylogEntry(
        'financials:debt:overduePay',
        { id, cid: debt.cid, debt },
        `Successfully paid debt of ${debt.debt} | id: ${id} | cid: ${debt.cid}`
      );
    } else {
      global.exports['dg-logs'].createGraylogEntry(
        'financials:debt:overduePay:failed',
        { id, cid: debt.cid, debt },
        `Failed to pay overdue debt of ${debt.debt} | id: ${id} | cid: ${debt.cid}`,
        true
      );
    }
    return success;
  }
}

const debtManager = DebtManager.getInstance();
export default debtManager;
