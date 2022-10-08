import { Notifications, SQL, Util } from '@dgx/server';
import { getConfig } from 'helpers/config';
import accountManager from 'modules/bank/classes/AccountManager';

import { debtLogger, scheduleOverDueDebt, unscheduleDebt } from '../helpers/debts';

class DebtManager extends Util.Singleton<DebtManager>() {
  private debts: Debts.Debt[];

  constructor() {
    super();
    this.debts = [];
  }

  async seedDebts() {
    const query = `
			SELECT *,
						 UNIX_TIMESTAMP(date) AS date
			FROM debts d
		`;
    this.debts = await SQL.query(query);
    this.debts.forEach(debt => scheduleOverDueDebt(debt.id));
  }

  public getDebtsByCid(cid: number): Debts.Debt[] {
    return this.debts.filter(debt => debt.cid === cid);
  }

  public getDebtById(id: number): Debts.Debt | undefined {
    return this.debts.find(debt => debt.id === id);
  }

  private replaceDebt(debt: Debts.Debt) {
    this.debts = this.debts.map(d => (d.id === debt.id ? debt : d));
  }

  public async addDebt(
    cid: number,
    target_account: string,
    fine: number,
    reason: string,
    origin: string,
    given_by?: number,
    type: Debts.Type = 'debt'
  ) {
    const debt: Debts.Debt = {
      id: 0,
      cid: cid,
      target_account,
      debt: fine,
      payed: 0,
      type,
      given_by: given_by ?? 0,
      origin_name: origin,
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
      Util.Log('financials:debt:add:failed', debt, `Failed to add debt for ${cid}`, undefined, true);
      return;
    }
    debt.id = result[0].id;
    debtLogger.info(
      `Added debt for ${cid} | cid: ${cid} | target: ${target_account} | fine: ${fine} | reason: ${reason} | given_by: ${given_by} | type: ${type}`
    );
    Util.Log('financials:debt:add', debt, `Added debt of ${fine} for ${cid}`);
    this.debts.push(debt);
    scheduleOverDueDebt(debt.id);
  }

  public async removeDebts(ids: number[]): Promise<void> {
    if (!ids.every(id => this.getDebtById(id) !== undefined)) {
      debtLogger.error('removeDebts called with invalid debt ids', ids);
      return;
    }
    const query = 'DELETE FROM debts WHERE id IN (?)';
    const result = await SQL.query(query, [ids.join(',')]);
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

  public async payDebt(src: number, id: number, percentage = 100): Promise<boolean> {
    const Player = DGCore.Functions.GetPlayer(src);
    if (!Player) {
      debtLogger.error(`payDebt called for unknown player ${src}`);
      return false;
    }
    const cid = Player.PlayerData.citizenid;
    const debt = this.getDebtById(id);
    if (!debt) {
      debtLogger.warn(`Failed to pay debt | id: ${id} | cid: ${cid}`);
      Util.Log('financials:debt:pay:failed', { id, cid }, `Failed to pay debt, non existing debt`);
      return false;
    }
    if (debt.cid !== cid) {
      debtLogger.warn(`Failed to pay debt | id: ${id} | cid: ${cid}`);
      Util.Log('financials:debt:pay:failed', { id, cid, debt }, `Failed to pay debt, cid didn't match`);
      return false;
    }
    const account = accountManager.getDefaultAccount(cid);
    if (!account) {
      debtLogger.warn(`Failed to pay debt | id: ${id} | cid: ${cid}`);
      Util.Log('financials:debt:pay:failed', { id, cid, debt }, `Failed to pay debt, no default account found`);
      return false;
    }
    const success = await account.transfer(
      debt.target_account,
      debt.given_by ?? cid,
      cid,
      debt.debt * (percentage / 100),
      debt.reason,
      true
    );
    if (success) {
      Util.Log('financials:debt:pay', { id, cid, debt }, `Successfully paid debt of ${debt.debt}`);
      if (percentage === 100) {
        this.removeDebts([id]);
      } else {
        // Update payed value in DB and manager storage
        debt.payed = Number((debt.payed + debt.debt * (percentage / 100)).toFixed(2));
        await SQL.query('UPDATE debts SET payed = ? WHERE id = ?', [debt.payed, debt.id]);
        this.replaceDebt(debt);
      }
    } else {
      Notifications.add(src, 'Je hebt te weinig geld op je rekening om dit te doen');
    }
    return success;
  }

  public async payDefaultedDebt(id: number): Promise<boolean> {
    const debt = this.getDebtById(id);
    if (!debt) {
      debtLogger.warn(`Failed to pay debt | id: ${id}`);
      Util.Log('financials:debt:overduePay:failed', { id }, `Failed to pay debt, non existing debt`);
      return false;
    }
    const account = accountManager.getDefaultAccount(debt.cid);
    if (!account) {
      debtLogger.warn(`Failed to pay debt | id: ${id} | cid: ${debt.cid}`);
      Util.Log(
        'financials:debt:overduePay:failed',
        { id, cid: debt.cid, debt },
        `Failed to pay debt, no default account found`
      );
      return false;
    }
    const newDebt = debt.debt * (1 + getConfig().debts.fineDefaultInterest / 100);
    const success = await account.transfer(
      debt.target_account,
      debt.given_by ?? debt.cid,
      debt.cid,
      newDebt,
      `Overtijd | ${debt.reason}`,
      true
    );
    if (success) {
      Util.Log('financials:debt:overduePay', { id, cid: debt.cid, debt }, `Successfully paid debt of ${debt.debt}`);
      this.removeDebts([id]);
    } else {
      Util.Log(
        'financials:debt:overduePay:failed',
        { id, cid: debt.cid, debt },
        `Failed to pay overdue debt of ${debt.debt}`,
        undefined,
        true
      );
    }
    return success;
  }

  async penaliseOverDueDebt(id: number) {
    const debt = this.getDebtById(id);
    if (!debt) {
      debtLogger.warn(`Failed to pay debt | id: ${id}`);
      Util.Log('financials:debt:penaliseOverdue:failed', { id }, `Failed to pay debt, non existing debt`);
      return;
    }
    const newDebt = debt.debt * (1 + getConfig().debts.fineOverDueInterest / 100);
    await SQL.query('UPDATE debts SET debt = ? WHERE id = ?', [newDebt, id]);
    Util.Log(
      'financials:debt:penaliseOverdue',
      { id, old: debt.debt, new: newDebt },
      `Updated debt with penalty from ${debt.debt} to ${newDebt}`
    );
  }
}

const debtManager = DebtManager.getInstance();
export default debtManager;
