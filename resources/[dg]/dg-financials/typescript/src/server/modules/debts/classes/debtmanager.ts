import { Notifications, SQL, Util } from '@dgx/server';

import { getDefaultAccount, getDefaultAccountId } from '../../bank/helpers/accounts';
import { transfer } from '../../bank/helpers/actions';
import { debtLogger, scheduleDebt, unscheduleDebt } from '../helpers/debts';

class DebtManager extends Util.Singleton<DebtManager>() {
  private debts: Debts.Debt[];
  private config: Config['debts'];

  constructor() {
    super();
    this.debts = [];
    this.seedDebts();
  }

  public setConfig(config: Config['debts']) {
    this.config = config;
  }

  public getConfig() {
    return this.config;
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

  public async removeDebts(ids: number[]): Promise<void> {
    if (!ids.every(id => this.getDebtById(id) !== undefined)) {
      debtLogger.error('removeDebts called with invalid debt ids', ids);
      return;
    }
    const query = 'DELETE FROM debts WHERE id IN ?';
    const result = await SQL.query(query, [ids]);
    if (!result.affectedRows) {
      debtLogger.error(`Failed to remove debt with ids ${ids}`, ids);
      Util.Log(
        'financials:debt:remove:failed',
        { ids, deleted: result.affectedRows },
        `Removed no debts but should have deleted ${ids.length} from the database`
      );
      this.seedDebts();
      return;
    }
    if (result.affectedRows !== ids.length) {
      debtLogger.error('Failed to remove all debts', ids);
      Util.Log(
        'financials:debt:remove:failed',
        { ids, deleted: result.affectedRows },
        `Removed ${result.affectedRows} debts but should have deleted ${ids.length} from the database`
      );
      this.seedDebts();
      return;
    }
    Util.Log(
      'financials:debt:remove',
      { ids, deleted: result.affectedRows },
      `Removed ${result.affectedRows} debts from the database`
    );
    this.debts = this.debts.filter(d => !ids.includes(d.id));
    ids.forEach(id => unscheduleDebt(id));
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
      this.removeDebts([id]);
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
    const newDebt = debt.debt * (1 + this.config.fineInterest / 100);
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
      this.removeDebts([id]);
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
