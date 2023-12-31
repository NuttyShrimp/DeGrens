import { Core, Events, Notifications, SQL, Util } from '@dgx/server';
import dayjs, { Dayjs } from 'dayjs';
import { getConfig } from 'helpers/config';
import accountManager from 'modules/bank/classes/AccountManager';

import { debtLogger, scheduleOverDueDebt, unscheduleDebt, getDaysUntilDue } from '../helpers/debts';
import {
  calculateMaintenceFees,
  getMaintenanceFeeSchedule,
  isMaintenanceFeesInWeekOrLess,
} from '../helpers/maintenanceFees';

class DebtManager extends Util.Singleton<DebtManager>() {
  private debts: Debts.Debt[];
  private cachedFeeds: Record<string, { fees: IFinancials.MaintenanceFee[]; created: Dayjs }> = {};

  constructor() {
    super();
    this.debts = [];
  }

  async seedDebts() {
    const query = `
			SELECT *,
						 UNIX_TIMESTAMP(date) AS date
			FROM debts d
      ORDER BY id
		`;
    this.debts = await SQL.query<(Omit<Debts.Debt, 'metadata'> & { metadata: string })[]>(query).then(ds =>
      ds.map(d => {
        d.metadata = d.metadata !== '' ? JSON.parse(d.metadata) : {};
        return d as unknown as Debts.Debt;
      })
    );
    this.debts.forEach(debt => scheduleOverDueDebt(debt.id));
  }

  private async getMaintenanceFees(cid: number): Promise<IFinancials.MaintenanceFee[]> {
    if (!this.cachedFeeds[cid]) {
      const fees = await calculateMaintenceFees([cid]);
      this.cachedFeeds[cid] = { fees, created: dayjs() };
      return fees;
    }
    let { fees, created } = this.cachedFeeds[cid];
    if (created.isBefore(dayjs().add(-1, 'h'))) {
      delete this.cachedFeeds[cid];
      return this.getMaintenanceFees(cid);
    }
    return fees;
  }

  public async getDebtsByCid(cid: number): Promise<Debts.Debt[]> {
    let debts = this.debts.filter(debt => debt.cid === cid);
    if (isMaintenanceFeesInWeekOrLess()) {
      const mainFees = await this.getMaintenanceFees(cid);
      const highestId = (debts.at(-1)?.id ?? 0) + 1;
      const payDate = getMaintenanceFeeSchedule().unix();
      mainFees.forEach((f, i) => {
        debts.push({
          ...f,
          origin_name: f.origin,
          id: highestId + i,
          payed: 0,
          type: 'scheduled',
          given_by: 1000,
          date: payDate,
          pay_term: 0,
        });
      });
    }
    return debts;
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
    metadata?: Financials.Debts.DebtMetadata,
    type: Debts.Type = 'debt'
  ) {
    const debt: Debts.Debt = {
      id: 0,
      cid: cid,
      target_account,
      debt: fine,
      payed: 0,
      type,
      given_by: metadata?.given_by ?? 1000,
      origin_name: origin,
      reason: reason,
      event: metadata?.cbEvt,
      date: Math.floor(Date.now() / 1000),
      pay_term: metadata?.payTerm,
    };
    if (metadata?.payTerm) delete metadata.payTerm;
    if (metadata?.cbEvt) delete metadata.cbEvt;
    if (metadata?.givenBy) delete metadata.givenBy;
    debt.metadata = metadata ?? {};
    const query = `
			INSERT INTO debts (cid, debt, target_account, type, given_by, origin_name, reason, date, event, pay_term, metadata)
			VALUES (?, ?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?), ?, ?, ?)
			RETURNING id
		`;
    const result = await SQL.query(query, [
      debt.cid,
      debt.debt,
      debt.target_account,
      debt.type,
      debt.given_by,
      debt.origin_name,
      debt.reason,
      debt.date,
      // mysql2 being mysql2
      debt.event ?? null,
      debt.pay_term ?? null,
      debt.metadata ? JSON.stringify(debt.metadata) : null,
    ]);
    if (!result || !result[0]) {
      debtLogger.error(
        `Failed to add debt for ${cid} | cid: ${cid} | target: ${target_account} | fine: ${fine} | reason: ${reason} | given_by: ${debt.given_by} | type: ${type}`
      );
      Util.Log('financials:debt:add:failed', debt, `Failed to add debt for ${cid}`, undefined, true);
      return;
    }
    debt.id = result[0].id;
    debtLogger.info(
      `Added debt for ${cid} | cid: ${cid} | target: ${target_account} | fine: ${fine} | reason: ${reason} | given_by: ${debt.given_by} | type: ${type}`
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
    const Player = Core.getPlayer(src);
    if (!Player) {
      debtLogger.error(`payDebt called for unknown player ${src}`);
      return false;
    }
    const cid = Player.citizenid;
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

    // Maintenance checks should always be payed of fully
    if (debt.type === 'maintenance') {
      percentage = 100;
    }

    const amount = (debt.debt - debt.payed) * (percentage / 100);
    const success = await account.transfer(debt.target_account, cid, cid, amount, debt.reason, false);
    if (success) {
      Util.Log('financials:debt:pay', { id, cid, debt }, `Successfully paid debt of ${amount}`);
      if (percentage === 100) {
        this.removeDebts([id]);
      } else {
        // Update payed value in DB and manager storage
        debt.payed = debt.payed + Number(amount.toFixed(2));
        await SQL.query('UPDATE debts SET payed = ? WHERE id = ?', [debt.payed, debt.id]);
        if (!debt.pay_term) {
          debt.pay_term = getDaysUntilDue(debt.payed);
          await SQL.query('UPDATE debts SET pay_term = ? WHERE id = ?', [debt.pay_term, debt.id]);
        }
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
    if (debt.event) {
      Events.emit(debt.event, debt);
      this.removeDebts([id]);
      return true;
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
    const newDebt = (debt.debt - debt.payed) * (1 + getConfig().debts.fineDefaultInterest / 100);
    const success = await account.transfer(
      debt.target_account,
      debt.cid,
      debt.cid,
      newDebt,
      `Overtijd | ${debt.reason}`,
      true
    );
    if (success) {
      Util.Log('financials:debt:overduePay', { id, cid: debt.cid, debt }, `Successfully paid debt of ${newDebt}`);
      this.removeDebts([id]);
    } else {
      Util.Log(
        'financials:debt:overduePay:failed',
        { id, cid: debt.cid, debt },
        `Failed to pay overdue debt of ${newDebt}`,
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
