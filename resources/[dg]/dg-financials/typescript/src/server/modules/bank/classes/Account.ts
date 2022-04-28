import winston from 'winston';
import { SQL } from '@dgx/server';

import { config } from '../../../config';
import { generateAccountId, generateTransactionId } from '../../../sv_util';
import { addCash, removeCash } from '../../cash/service';
import { ActionPermission, bankLogger, generateSplittedInfo } from '../utils';

import { AccountManager } from './AccountManager';
import { PermissionsManager } from './PermissionsManager';

export class Account {
  private readonly account_id: string;
  private readonly name: string;
  private readonly accType: AccountType;
  private permsManager: PermissionsManager;
  private balance: number;
  private transactions: Record<TransactionType, DB.ITransaction[]> = {
    deposit: [],
    withdraw: [],
    transfer: [],
    purchase: [],
    paycheck: [],
    mobile_transaction: [],
  };
  private transactionsIds: string[];
  private manager: AccountManager;
  private logger: winston.Logger;

  constructor(account_id: string, name: string, type: AccountType, balance = 0, members: IAccountMember[] = []) {
    this.account_id = account_id;
    this.name = name;
    this.accType = type;
    this.balance = balance;
    this.manager = AccountManager.getInstance();
    this.logger = bankLogger.child({ module: account_id });
    this.logger.silly(
      `Account ${this.account_id} created | name: ${this.name} | accountType: ${this.accType} | balance: ${this.balance}`
    );
    this.permsManager = new PermissionsManager(account_id, members);
    // fetch all transactionids for this account
    // We only fetch ids so the cache is not overfilled with data which could slow down the resource
    this.getDBTransactionsIds().then(transactionIds => {
      this.transactionsIds = transactionIds ?? [];
    });
  }

  public static async create(cid: number, name: string, accType: AccountType): Promise<Account> {
    const accId = generateAccountId();
    const query = `
      INSERT INTO bank_accounts (account_id, name, type)
      VALUES (?, ?, ?) RETURNING *
    `;
    await SQL.query(query, [accId, name, accType]);
    const _account = new Account(accId, name, accType);
    _account.permsManager.addPermissions(cid, 15);
    return _account;
  }

  // region Getters
  public getType(): AccountType {
    return this.accType;
  }

  public getAccountId(): string {
    return this.account_id;
  }

  public getName(): string {
    return this.name;
  }

  public getBalance(): number {
    return this.balance;
  }

  public getClientVersion(cid: number): IAccount {
    const access_level = this.permsManager.getMemberLevel(cid);
    this.logger.silly(`getClientVersion | cid: ${cid} | perm: ${access_level}`);
    return {
      account_id: this.account_id,
      name: this.name,
      type: this.accType,
      balance: this.balance,
      permissions: this.permsManager.buildPermissions(access_level),
    };
  }

  public hasAccess(cid: number): boolean {
    return this.permsManager.hasAccess(cid);
  }

  // endregion
  //region Setters
  public changeBalance(amount: number): void {
    this.logger.info(`changeBalance | amount: ${amount}`);
    this.balance += amount;
  }

  // endregion
  //region DB

  private async updateBalance(): Promise<void> {
    const query = `
      UPDATE bank_accounts
      SET balance = ?
      WHERE account_id = ?
    `;
    await SQL.query(query, [this.balance, this.account_id]);
  }

  private async AddDBTransaction(transaction: DB.ITransaction): Promise<void> {
    const query = `
      INSERT INTO transaction_log
      (transaction_id, origin_account_id, target_account_id, \` change \`, comment, triggered_by, accepted_by, date,
       type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await SQL.query(query, [
      transaction.transaction_id,
      transaction.origin_account_id,
      transaction.target_account_id,
      transaction.change,
      transaction.comment,
      transaction.triggered_by,
      transaction.accepted_by,
      transaction.date,
      transaction.type,
    ]);
    // Add transaction to front of array
    this.transactions[transaction.type].unshift(transaction);
    this.transactionsIds.push(transaction.transaction_id);
    this.updateBalance();
  }

  private async getDBTransactionsIds(): Promise<string[]> {
    const query = `
      SELECT DISTINCT transaction_id
      FROM transaction_log
      WHERE origin_account_id = ?
         OR target_account_id = ?
      ORDER BY date DESC
    `;
    const transactionsIds: string[] = await SQL.query(query, [this.account_id, this.account_id]);
    return transactionsIds;
  }

  private async getDBTransactions(
    offset: number,
    limit = config.accounts.transactionLimit,
    type?: TransactionType
  ): Promise<DB.ITransaction[]> {
    const query = `
      SELECT *
      FROM transaction_log
      WHERE (origin_account_id = ?
        OR target_account_id = ?)
        ${type ? 'AND type = ?' : ''}
      ORDER BY date
        DESC
        LIMIT ?, ?
    `;
    let params = [this.account_id, this.account_id, offset, limit];
    if (type) {
      params = [...params.slice(0, 2), type, ...params.slice(2, 4)];
    }
    const transactions: DB.ITransaction[] = await SQL.query(query, params);
    Object.keys(this.transactions).forEach((tType: TransactionType) => {
      this.transactions[tType].push(...transactions.filter(t => t.type === tType));
    });
    return transactions;
  }

  // endregion
  // region Actions
  /**
   * Internal function to combine checks and prevent code-duplication
   * @param type
   * @param triggerCid
   * @param amount
   * @param extra Object with extra attributes needed for this action
   * @private
   */
  private async actionValidation(
    type: TransactionType,
    triggerCid: number,
    amount: number,
    extra: {
      targetAccountId?: string;
      acceptorCid?: number;
      /**
       * Overrides check if amount is smaller than acc balance
       */
      canBeNegative?: boolean;
      targetPhone?: string;
    } = {}
  ): Promise<boolean> {
    const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
    const infoStr = generateSplittedInfo({
      cid: triggerCid,
      account: this.account_id,
      amount,
      ...extra,
    });
    try {
      // region Player Validation
      if (!triggerPlayer) {
        global.exports['dg-logs'].createGraylogEntry(
          'financials:invalidPlayer',
          {
            cid: triggerCid,
            action: type,
            account: this.account_id,
            amount,
            plyType: 'target',
            ...extra,
          },
          `${triggerPlayer.PlayerData.name} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but was not found in the core as a valid player`,
          true
        );
        this.logger.warn(
          `${type}: invalid player | ${generateSplittedInfo({
            cid: triggerCid,
            account: this.account_id,
            amount,
            ...extra,
          })}`
        );
        return false;
      }
      if (extra.targetPhone) {
        const targetPlayer = DGCore.Functions.GetPlayerByPhone(extra.targetPhone);
        if (!targetPlayer) {
          global.exports['dg-logs'].createGraylogEntry(
            'financials:invalidPlayer',
            {
              cid: triggerCid,
              action: type,
              account: this.account_id,
              amount,
              plyType: 'acceptor',
              ...extra,
            },
            `${triggerPlayer.PlayerData.name} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but targeted an invalid player`,
            true
          );
          this.logger.warn(`${type}: invalid player | ${infoStr}`);
          return false;
        }
        extra.acceptorCid = targetPlayer.PlayerData.citizenid;
        extra.targetAccountId = (await this.manager.getDefaultAccount(extra.acceptorCid)).account_id;
      }
      if (extra.acceptorCid) {
        if (triggerCid != extra.acceptorCid && !DGCore.Functions.GetPlayerByCitizenId(extra.acceptorCid)) {
          global.exports['dg-logs'].createGraylogEntry(
            'financials:invalidPlayer',
            {
              cid: triggerCid,
              action: type,
              account: this.account_id,
              amount,
              plyType: 'acceptor',
              ...extra,
            },
            `${triggerPlayer.PlayerData.name} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but was not found in the core as a valid player`,
            true
          );
          this.logger.warn(`${type}: invalid player | ${infoStr}`);
          return false;
        }
      }
      // endregion
      // region Permissions Check
      if (!this.permsManager.hasPermission(triggerCid, ActionPermission[type])) {
        emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, "You don't have the permissions for this", 'error');
        global.exports['dg-logs'].createGraylogEntry(
          'financials:missingPermissions',
          {
            cid: triggerCid,
            action: type,
            account: this.account_id,
            ...extra,
          },
          `${triggerPlayer.PlayerData.name} tried to ${type} ${amount} of ${this.name} (${this.account_id}) but did not have the permissions`
        );
        this.logger.info(`${type}: missing permissions | ${infoStr}`);
        // TODO add some anti-cheat measures
        return false;
      }
      if (type === 'transfer') {
        const targetAccount = this.manager.getAccountById(extra.targetAccountId);
        if (!targetAccount.permsManager.hasPermission(extra.acceptorCid, 'transfer')) {
          emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, "You don't have the permissions for this", 'error');
          global.exports['dg-logs'].createGraylogEntry(
            'financials:missingPermissions',
            {
              cid: triggerCid,
              action: 'transfer',
              origin_account: this.account_id,
              ...extra,
            },
            `${triggerPlayer.PlayerData.name} tried to transfer ${amount} from ${this.name} (${this.account_id}) to ${targetAccount.name} (accountId: ${targetAccount.account_id} | accepted_by: ${extra.acceptorCid}) but did not have the permissions`
          );
          this.logger.info(`transfer: missing permissions ${infoStr}`);
          // TODO add some anti-cheat measures
          return false;
        }
      }
      // endregion
      // region Amount validation
      amount = parseInt(String(amount));
      if (amount <= 0) {
        global.exports['dg-logs'].createGraylogEntry(
          'financials:invalidAmount',
          {
            cid: triggerCid,
            action: type,
            origin_account: this.account_id,
            amount,
            ...extra,
          },
          `${triggerPlayer.PlayerData.name} tried to ${type} ${amount} from ${this.name} (${this.account_id}) but gave an invalid amount(negative)`
        );
        this.logger.info(`${type}: invalid amount | ${infoStr}`);
        return false;
      }
      if (amount > this.balance && !extra?.canBeNegative) {
        emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, `Account balance is to low!`, 'error');
        this.logger.debug(`${type}: amount higher than account balance | ${infoStr}`);
        return false;
      }
      return true;
      // endregion
    } catch (e) {
      global.exports['dg-logs'].createGraylogEntry(
        'financials:invalidAmount',
        {
          cid: triggerCid,
          action: type,
          account: this.account_id,
          amount,
          plyType: 'target',
          e,
          ...extra,
        },
        `${triggerPlayer.PlayerData.name} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but the amount could not be parsed to a valid value`,
        true
      );
      this.logger.warn(
        `${type}: failed to parse amount to valid number | ${generateSplittedInfo({
          cid: triggerCid,
          account: this.account_id,
          amount,
          ...extra,
        })}`
      );
      return false;
    }
  }

  public async deposit(triggerCid: number, amount: number, comment?: string) {
    if (!(await this.actionValidation('deposit', triggerCid, amount, {}))) return;
    const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
    amount = parseInt(String(amount));
    const success = removeCash(triggerPlayer.PlayerData.source, amount, `deposit to ${this.name} (${this.account_id})`);
    if (!success) {
      emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, `Not enough money to do this!`, 'error');
      this.logger.debug(
        `deposit: not enough money | cid: ${triggerCid} | account: ${this.account_id} | accountBalance: ${this.balance} | amount: ${amount}`
      );
      return;
    }
    await this.addTransaction(this.account_id, this.account_id, triggerCid, amount, 'deposit', comment);
    this.balance += amount;
    global.exports['dg-logs'].createGraylogEntry(
      'financials:deposit:success',
      {
        cid: triggerCid,
        account: this.account_id,
        amount,
        action: 'deposit',
        comment,
      },
      `${triggerPlayer.PlayerData.name} deposited ${amount} to ${this.name} (${this.account_id})`
    );
    this.logger.info(
      `deposit: success | cid: ${triggerCid} | account: ${this.account_id} | accountBalance: ${this.balance} | amount: ${amount}`
    );
  }

  public async withdraw(triggerCid: number, amount: number, comment?: string) {
    if (!(await this.actionValidation('deposit', triggerCid, amount, {}))) return;
    const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
    amount = parseInt(String(amount));
    this.balance -= amount;
    addCash(triggerPlayer.PlayerData.source, amount, `Withdraw from ${this.name} (${this.account_id})`);
    await this.addTransaction(this.account_id, this.account_id, triggerCid, amount, 'withdraw', comment);
    global.exports['dg-logs'].createGraylogEntry(
      'financials:withdraw:success',
      {
        cid: triggerCid,
        account: this.account_id,
        amount,
        action: 'withdraw',
        comment,
      },
      `${triggerPlayer.PlayerData.name} withdrew ${amount} from ${this.name} (${this.account_id})`
    );
    this.logger.info(
      `withdraw: success | cid: ${triggerCid} | account: ${this.account_id} | accountBalance: ${this.balance} | amount: ${amount}`
    );
  }

  public async transfer(
    targetAccountId: string,
    triggerCid: number,
    acceptorCid: number,
    amount: number,
    comment?: string,
    canBeNegative = false
  ): Promise<boolean> {
    if (
      !(await this.actionValidation('transfer', triggerCid, amount, {
        acceptorCid,
        targetAccountId,
        canBeNegative,
      }))
    )
      return false;
    const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
    const targetAccount = this.manager.getAccountById(targetAccountId);
    amount = parseInt(String(amount));
    this.balance -= amount;
    targetAccount.changeBalance(-amount);
    await this.addTransaction(this.account_id, targetAccountId, triggerCid, amount, 'transfer', comment, acceptorCid);
    global.exports['dg-logs'].createGraylogEntry(
      'financials:transfer:success',
      {
        cid: triggerCid,
        acceptor_cid: acceptorCid,
        account: this.account_id,
        targetAccountId,
        amount,
        action: 'transfer',
        comment,
        canBeNegative,
      },
      `${triggerPlayer.PlayerData.name} transfer ${amount} from ${this.name} (${this.account_id}) to ${targetAccount.name} (accountId: ${targetAccount.account_id} | accepted_by: ${acceptorCid})`
    );
    this.logger.info(
      `transfer: success | cid: ${triggerCid} | acceptor_cid: ${acceptorCid} | account: ${this.account_id} | targetAccount: ${targetAccountId} | amount: ${amount}`
    );
    return true;
  }

  public async purchase(triggerCid: number, amount: number, comment?: string): Promise<boolean> {
    if (!(await this.actionValidation('purchase', triggerCid, amount))) return false;
    const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
    amount = parseInt(String(amount));
    this.balance -= amount;
    await this.addTransaction(this.account_id, 'BE1', triggerCid, amount, 'purchase', comment);
    this.logger.info(`purchase: success | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`);
    global.exports['dg-logs'].createGraylogEntry(
      'financials:purchase:success',
      {
        cid: triggerCid,
        account: this.account_id,
        amount,
        action: 'purchase',
        comment,
      },
      `${triggerPlayer.PlayerData.name} made a purchase of ${amount} from ${this.name} (${this.account_id})`
    );
    return true;
  }

  public async paycheck(triggerCid: number, amount: number): Promise<boolean> {
    if (
      !(await this.actionValidation('paycheck', triggerCid, amount, {
        canBeNegative: true,
      }))
    )
      return false;
    const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
    amount = parseInt(String(amount));
    if (this.accType != 'standard') {
      emitNet(
        'DGCore:Notify',
        triggerPlayer.PlayerData.source,
        'This account accType does not support purchases',
        'error'
      );
      global.exports['dg-logs'].createGraylogEntry(
        'financials:invalidAccountType',
        {
          cid: triggerCid,
          account: this.account_id,
          amount,
          action: 'paycheck',
        },
        `${triggerPlayer.PlayerData.name} tried to takeout his paycheck of €${amount} in ${this.name} (${this.account_id}) but the account type is not standard`
      );
      this.logger.debug(
        `paycheck: invalid account type | cid: ${triggerCid} | account: ${this.account_id} | accountType: ${this.accType} | amount: ${amount}`
      );
      return false;
    }
    this.balance += amount;
    await this.addTransaction('BE1', this.account_id, triggerCid, amount, 'paycheck', 'Paycheck');
    global.exports['dg-logs'].createGraylogEntry(
      'financials:paycheck:success',
      {
        cid: triggerCid,
        account: this.account_id,
        amount,
        action: 'paycheck',
      },
      `${triggerPlayer.PlayerData.name} took out his paycheck of €${amount} into ${this.name} (${this.account_id})`
    );
    this.logger.info(`paycheck: success | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`);
    return true;
  }

  public async mobileTransfer(
    targetPhone: string,
    triggerCid: number,
    amount: number,
    comment?: string
  ): Promise<boolean> {
    if (
      !(await this.actionValidation('mobile_transaction', triggerCid, amount, {
        targetPhone,
      }))
    )
      return false;
    const targetPlayer = DGCore.Functions.GetPlayerByPhone(targetPhone);
    const acceptorCid = targetPlayer.PlayerData.citizenid;
    const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
    const targetAccount = await this.manager.getDefaultAccount(acceptorCid);
    const targetAccountId = targetAccount.account_id;
    amount = parseInt(String(amount));
    this.balance -= amount;
    targetAccount.changeBalance(-amount);
    await this.addTransaction(
      this.account_id,
      targetAccountId,
      triggerCid,
      amount,
      'mobile_transaction',
      comment,
      acceptorCid
    );
    global.exports['dg-logs'].createGraylogEntry(
      'financials:mobile_transaction:success',
      {
        cid: triggerCid,
        acceptor_cid: acceptorCid,
        account: this.account_id,
        targetAccountId,
        amount,
        action: 'mobile_transaction',
        comment,
      },
      `${triggerPlayer.PlayerData.name} mobile_transaction ${amount} from ${this.name} (${this.account_id}) to ${targetAccount.name} (accountId: ${targetAccount.account_id} | accepted_by: ${acceptorCid})`
    );
    this.logger.info(
      `mobile_transaction: success | cid: ${triggerCid} | acceptor_cid: ${acceptorCid} | account: ${this.account_id} | targetAccount: ${targetAccountId} | amount: ${amount}`
    );
    return true;
  }

  // endregion
  // region Transactions
  private sortTransactions(trans: DB.ITransaction[], custom = false): any {
    const duplicatedIds: Record<string, number> = {};
    trans = trans
      .filter(t => {
        const thisTransDupLength = trans.filter(t2 => t.transaction_id === t2.transaction_id).length;
        if (thisTransDupLength === 1) {
          return true;
        }
        if (!duplicatedIds[t.transaction_id]) duplicatedIds[t.transaction_id] = 0;
        duplicatedIds[t.transaction_id]++;
        return thisTransDupLength === duplicatedIds[t.transaction_id];
      })
      .sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
      });
    if (custom) {
      return trans;
    }
  }

  private getTransactionsArray(type?: TransactionType): DB.ITransaction[] {
    let _transactions: DB.ITransaction[] = [];
    Object.keys(this.transactions).forEach((tType: TransactionType) => {
      if (!type) {
        _transactions = _transactions.concat(this.transactions[tType]);
      }
      if (tType !== type) return;
      _transactions = _transactions.concat(this.transactions[tType]);
    });
    return _transactions;
  }

  public async getTransactions(
    source: number | string,
    offset: number,
    type: TransactionType
  ): Promise<ITransaction[]> {
    try {
      const Player = DGCore.Functions.GetPlayer(source);
      if (!Player) {
        global.exports['dg-logs'].createGraylogEntry(
          'financials:invalidPlayer',
          {
            cid: Player.PlayerData.citizenid,
            action: 'getTransactions',
            account: this.account_id,
          },
          `${Player.PlayerData.name} tried to fetch transactions of ${this.name} (${this.account_id}) but was not found in the core as a valid player`
        );
        this.logger.warn(`getTransactions: invalid player | src: ${source} | account: ${this.account_id}`);
        return [];
      }
      if (!this.permsManager.hasPermission(Player.PlayerData.citizenid, 'transactions')) {
        emitNet('DGCore:Notify', Player.PlayerData.source, "You don't have the permissions for this", 'error');
        global.exports['dg-logs'].createGraylogEntry(
          'financials:missingPermissions',
          {
            cid: Player.PlayerData.citizenid,
            action: 'getTransactions',
            account: this.account_id,
          },
          `${Player.PlayerData.name} tried to fetch transactions for ${this.name} (${this.account_id}) but did not have the permissions`
        );
        this.logger.info(`getTransactions: missing permissions | src: ${source} | account: ${this.account_id}`);
        // TODO add some anti-cheat measures
        return [];
      }
      let dbTransactions = this.getTransactionsArray(type).slice(offset, offset + config.accounts.transactionLimit);
      if (dbTransactions.length < config.accounts.transactionLimit) {
        const _trans = await this.getDBTransactions(
          offset + dbTransactions.length,
          config.accounts.transactionLimit - dbTransactions.length,
          type
        );
        dbTransactions = this.sortTransactions(dbTransactions.concat(_trans), true);
      }
      this.logger.debug(
        `getTransactions: success | src: ${source} | account: ${this.account_id} | amount: ${dbTransactions.length}`
      );
      return dbTransactions.map<ITransaction>(t => {
        return this.buildTransaction(t);
      });
    } catch (e) {
      this.logger.error('Error getting transactions', e);
    }
  }

  public doesTransactionExist(id: string): boolean {
    // Check if transaction exists in ids array
    return (this.transactionsIds ?? []).includes(id);
  }

  private buildTransaction(transaction: DB.ITransaction): ITransaction {
    const _t: ITransaction = {
      ...transaction,
      origin_account_name: '',
      target_account_name: '',
    };
    try {
      // region User info
      const triggerInfo = DGCore.Functions.GetOfflinePlayerByCitizenId(Number(_t.triggered_by));
      _t.triggered_by = `${triggerInfo.PlayerData.charinfo.firstname} ${triggerInfo.PlayerData.charinfo.lastname}`;
      _t.accepted_by = _t.triggered_by;
      if (_t.triggered_by !== _t.accepted_by) {
        const acceptInfo = DGCore.Functions.GetOfflinePlayerByCitizenId(Number(_t.accepted_by));
        _t.accepted_by = `${acceptInfo.PlayerData.charinfo.firstname} ${acceptInfo.PlayerData.charinfo.lastname}`;
      }
      // endregion
      // region Account info=
      const originAccount = this.manager.getAccountById(_t.origin_account_id, true);
      _t.origin_account_name = originAccount ? originAccount.getName() : 'Unknown Account';
      _t.target_account_name = _t.target_account_id;
      if (_t.origin_account_id !== _t.target_account_id) {
        const targetAccount = this.manager.getAccountById(_t.target_account_id, true);
        _t.target_account_name = targetAccount ? targetAccount.getName() : 'Unknown Account';
      }
      // endregion
      return _t;
    } catch (e) {
      this.logger.error(`Error building transaction for ${_t.transaction_id}`, e);
    }
  }

  private async addTransaction(
    originAccountId: string,
    targetAccountId: string,
    trigger_cid: number,
    amount: number,
    type: TransactionType,
    comment = '',
    acceptor_cid?: number
  ): Promise<DB.ITransaction> {
    const _transaction: DB.ITransaction = {
      transaction_id: generateTransactionId(),
      origin_account_id: originAccountId,
      target_account_id: targetAccountId,
      triggered_by: trigger_cid,
      accepted_by: acceptor_cid ?? trigger_cid,
      change: amount,
      type,
      comment,
      date: Date.now(),
    };
    this.logger.silly(
      `Adding transaction ${_transaction.transaction_id} | ${_transaction.origin_account_id} -> ${_transaction.target_account_id} | change: ${_transaction.change} | type: ${_transaction.type} | comment: ${_transaction.comment}`
    );
    await this.AddDBTransaction(_transaction);
    return _transaction;
  }

  // endregion
}
