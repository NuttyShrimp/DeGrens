import { Notifications, SQL, Util } from '@dgx/server';
import { getConfig } from 'helpers/config';
import { getTaxedPrice } from 'modules/taxes/service';
import winston from 'winston';

import { config } from '../../../config';
import { generateAccountId, generateTransactionId } from '../../../sv_util';
import { addCash, removeCash } from '../../cash/service';
import { ActionPermission, bankLogger, generateSplittedInfo, sortTransactions } from '../utils';
import accountManager from './AccountManager';

import { PermissionsManager } from './PermissionsManager';
import { charModule } from 'helpers/core';
import { getTransactionIdsForAccount } from '../helpers/transactionCache';

export class Account {
  private readonly account_id: string;
  private readonly name: string;
  private readonly accType: AccountType;
  private balance: number;
  public lastOperation: number;
  private transactions: Record<TransactionType, DB.ITransaction[]> = {
    deposit: [],
    withdraw: [],
    transfer: [],
    purchase: [],
    paycheck: [],
    mobile_transaction: [],
  };
  private transactionsIds: string[];
  private readonly logger: winston.Logger;
  public readonly permsManager: PermissionsManager;
  private readonly isSeededAccount: boolean;

  constructor(
    account_id: string,
    name: string,
    type: AccountType,
    balance = 0,
    members: IAccountMember[] = [],
    updatedAt: number = Date.now()
  ) {
    this.account_id = account_id;
    this.name = name;
    this.accType = type;
    this.balance = balance;
    this.logger = bankLogger.child({ module: account_id });
    this.logger.silly(
      `Account ${this.account_id} created | name: ${this.name} | accountType: ${this.accType} | balance: ${this.balance}`
    );
    this.permsManager = new PermissionsManager(account_id, members);
    this.lastOperation = updatedAt;
    this.transactionsIds = [];
    this.isSeededAccount = accountManager.getSeededAccountIds().some(aId => aId === this.account_id);

    // fetch all transactionids for this account
    // We only fetch ids so the cache is not overfilled with data which could slow down the resource
    // When getting transactions for client we fetch all data
    this.transactionsIds = getTransactionIdsForAccount(this.account_id);
  }

  // Create new account and insert into db
  public static async create(cid: number, name: string, accType: AccountType): Promise<Account> {
    const accId = generateAccountId();
    const query = `
      INSERT INTO bank_accounts (account_id, name, type, balance)
      VALUES (?, ?, ?, 0)
    `;
    await SQL.query(query, [accId, name, accType]);
    const account = new Account(accId, name, accType);
    account.permsManager.addPermissions(cid, 31); // Set as owner
    return account;
  }

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

  public async getClientVersion(cid: number) {
    const access_level = this.permsManager.getMemberLevel(cid);
    this.logger.silly(`getClientVersion | cid: ${cid} | perm: ${access_level}`);
    const clientVersion: IAccount = {
      account_id: this.account_id,
      name: this.name,
      type: this.accType,
      balance: this.balance,
      permissions: this.permsManager.getMemberPermissions(cid),
    };
    if (this.accType === 'savings') {
      const accountOwnerCid = this.permsManager.getAccountOwner()?.cid;
      if (accountOwnerCid !== undefined) {
        clientVersion.members = await Promise.all(
          this.permsManager
            .getMembers()
            .filter(m => m.cid !== accountOwnerCid)
            .map(async m => {
              const player = await charModule.getOfflinePlayer(m.cid);
              let name = 'Unknown Person';
              if (player?.charinfo != undefined) {
                name = `${player.charinfo?.firstname} ${player.charinfo.lastname}`;
              }
              return {
                cid: m.cid,
                name,
                ...this.permsManager.getMemberPermissions(m.cid),
              };
            })
        );
      }
    }
    return clientVersion;
  }
  public hasAccess(cid: number): boolean {
    return this.permsManager.hasAccess(cid);
  }

  public getContext(): AccountContext {
    return {
      account_id: this.account_id,
      name: this.name,
      type: this.accType,
      balance: this.balance,
      members: this.permsManager.getMembers(),
    };
  }

  public setBalance(amount: number): void {
    amount = Number(amount.toFixed(2));
    this.logger.info(`setBalance | amount: ${amount}`);
    this.balance = amount;
    this.lastOperation = Date.now();
    this.updateBalance();
  }

  public changeBalance(amount: number): void {
    amount = Number(amount.toFixed(2));
    this.logger.debug(`changeBalance | amount: ${amount}`);
    this.balance += amount;
    this.lastOperation = Date.now();
    this.updateBalance();
  }

  private async updateBalance(): Promise<void> {
    const query = `
      UPDATE bank_accounts
      SET balance = ?
      WHERE account_id = ?
    `;
    await SQL.query(query, [this.balance, this.account_id]);
  }

  private async insertTransactionInDatabase(transaction: DB.ITransaction): Promise<void> {
    const query = `
      INSERT INTO transaction_log
      (transaction_id, origin_account_id, origin_account_name, origin_change, target_account_id, target_account_name, target_change, comment, triggered_by, accepted_by, date,
       type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await SQL.query(query, [
      transaction.transaction_id,
      transaction.origin_account_id,
      transaction.origin_account_name,
      transaction.origin_change,
      transaction.target_account_id,
      transaction.target_account_name,
      transaction.target_change,
      transaction.comment,
      transaction.triggered_by,
      transaction.accepted_by,
      transaction.date,
      transaction.type,
    ]);
  }

  private async getTransactionsFromDatabase(
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
    (Object.keys(this.transactions) as TransactionType[]).forEach((tType: TransactionType) => {
      this.transactions[tType].push(...transactions.filter(t => t.type === tType));
    });
    return transactions;
  }

  /**
   * Internal function to combine checks and prevent code-duplication
   * @param type
   * @param triggerCid
   * @param amount
   * @param extra Object with extra attributes needed for this action
   */
  private async actionValidation(
    type: TransactionType,
    triggerCid: number,
    amount: number,
    extra: {
      targetAccountId?: string;
      acceptorCid?: number;
      canBeNegative?: boolean;
      balanceDecrease?: boolean;
      targetPhone?: string;
    } = {}
  ): Promise<boolean> {
    const triggerPlayer = await charModule.getOfflinePlayer(triggerCid);
    const infoStr = generateSplittedInfo({
      cid: triggerCid,
      account: this.account_id,
      amount,
      ...extra,
    });

    // Check if trigger player exists
    if (!triggerPlayer) {
      Util.Log(
        'financials:invalidPlayer',
        {
          cid: triggerCid,
          action: type,
          account: this.account_id,
          amount,
          plyType: 'target',
          ...extra,
        },
        `${triggerCid} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but was not found in the core as a valid player`,
        undefined,
        true
      );
      this.logger.warn(`${type}: invalid player | ${infoStr}`);
      return false;
    }

    try {
      const triggerPlyId = triggerPlayer.serverId;
      const triggerPlyName = !triggerPlyId ? triggerPlayer.citizenid : Util.getName(triggerPlyId);

      // With this, there is currently no way to transfer by script from for ex business to ply when owner is not online
      // if (!triggerPlyId) {
      //   Util.Log(
      //     'financials:invalidPlayer',
      //     {
      //       cid: triggerCid,
      //       action: type,
      //       account: this.account_id,
      //       amount,
      //       plyType: 'target',
      //       ...extra,
      //     },
      //     `${triggerCid} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but was not found in the core as a valid player`,
      //     undefined,
      //     true
      //   );
      //   this.logger.warn(`${type}: invalid player | ${infoStr}`);
      //   return false;
      // }

      // Check if target is phonenumber
      if (extra.targetPhone) {
        const targetPlayer = await charModule.getOfflinePlayerByPhone(extra.targetPhone);
        if (!targetPlayer) {
          Util.Log(
            'financials:invalidPlayer',
            {
              cid: triggerCid,
              action: type,
              account: this.account_id,
              amount,
              plyType: 'acceptor',
              ...extra,
            },
            `${triggerPlyName} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but targeted invalid player`,
            triggerPlyId,
            true
          );
          this.logger.warn(`${type}: invalid player | ${infoStr}`);
          return false;
        }
        extra.acceptorCid = targetPlayer.citizenid;
        const acceptorAccount = accountManager.getDefaultAccount(extra.acceptorCid);
        if (!acceptorAccount) {
          Util.Log(
            'financials:invalidPlayer',
            {
              cid: triggerCid,
              action: type,
              account: this.account_id,
              amount,
              plyType: 'acceptor',
              ...extra,
            },
            `${triggerPlyName} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but could not find default account for target`,
            triggerPlyId,
            true
          );
          this.logger.warn(`${type}: invalid player | ${infoStr}`);
          return false;
        }
        extra.targetAccountId = acceptorAccount.account_id;
      }

      // Check if acceptorCid exists
      if (extra.acceptorCid && extra.acceptorCid !== triggerCid) {
        const acceptorPlayer = await charModule.getOfflinePlayer(extra.acceptorCid);
        if (!acceptorPlayer) {
          Util.Log(
            'financials:invalidPlayer',
            {
              cid: triggerCid,
              action: type,
              account: this.account_id,
              amount,
              plyType: 'acceptor',
              ...extra,
            },
            `${triggerPlyName} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but was invalid player`,
            triggerPlyId,
            true
          );
          this.logger.warn(`${type}: invalid player | ${infoStr}`);
          return false;
        }
      }

      // Check if trigger player has perms for this account
      if (!this.permsManager.hasPermission(triggerCid, ActionPermission[type])) {
        if (triggerPlyId) {
          Notifications.add(triggerPlyId, 'Je hebt geen toegang tot deze account', 'error');
        }
        Util.Log(
          'financials:missingPermissions',
          {
            cid: triggerCid,
            action: type,
            account: this.account_id,
            ...extra,
          },
          `${triggerPlyName} tried to ${type} ${amount} of ${this.name} (${this.account_id}) but did not have the permissions`,
          triggerPlyId
        );
        this.logger.info(`${type}: missing permissions | ${infoStr}`);
        return false;
      }

      // Check if amount not negative
      amount = parseInt(String(amount));
      if (amount < 0) {
        Util.Log(
          'financials:invalidAmount',
          {
            cid: triggerCid,
            action: type,
            origin_account: this.account_id,
            amount,
            ...extra,
          },
          `${triggerPlyName} tried to ${type} ${amount} from ${this.name} (${this.account_id}) but gave an invalid amount (negative)`,
          triggerPlyId
        );
        this.logger.info(`${type}: invalid amount | ${infoStr}`);
        return false;
      }

      // If we are going to decrease balance, then check if not negative or if negative is allowed
      const balanceDecrease = extra.balanceDecrease ?? false;
      const canBeNegative = extra.canBeNegative ?? this.isSeededAccount;
      if (balanceDecrease && !canBeNegative && this.balance - amount < 0) {
        if (triggerPlyId) {
          Notifications.add(triggerPlyId, 'Niet genoeg geld in bankaccount', 'error');
        }
        this.logger.debug(`${type}: amount higher than account balance | ${infoStr}`);
        return false;
      }

      return true;
    } catch (e) {
      console.error(e);
      Util.Log(
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
        `${triggerPlayer.name} tried to ${type} ${amount} to ${this.name} (${this.account_id}) but the amount could not be parsed to a valid value`,
        undefined,
        true
      );
      this.logger.warn(`${type}: failed to parse amount to valid number | ${infoStr}`);
      return false;
    }
  }

  public async deposit(triggerCid: number, amount: number, comment?: string) {
    const isValid = await this.actionValidation('deposit', triggerCid, amount);
    if (!isValid) return false;

    const triggerPlyId = charModule.getServerIdFromCitizenId(triggerCid);
    if (!triggerPlyId) return false;

    amount = parseInt(String(amount));
    const success = removeCash(triggerPlyId, amount, `deposit to ${this.name} (${this.account_id})`);
    if (!success) {
      Notifications.add(triggerPlyId, 'Je hebt niet genoeg cash', 'error');
      this.logger.debug(
        `deposit: not enough money | cid: ${triggerCid} | account: ${this.account_id} | accountBalance: ${this.balance} | amount: ${amount}`
      );
      return false;
    }
    this.changeBalance(amount);

    await this.addTransaction(this.account_id, this.account_id, triggerCid, amount, amount, 'deposit', comment);
    Util.Log(
      'financials:deposit:success',
      {
        cid: triggerCid,
        account: this.account_id,
        amount,
        action: 'deposit',
        comment,
      },
      `${Util.getName(triggerPlyId)} deposited ${amount} to ${this.name} (${this.account_id})`,
      triggerPlyId
    );
    this.logger.info(
      `deposit: success | cid: ${triggerCid} | account: ${this.account_id} | accountBalance: ${this.balance} | amount: ${amount}`
    );
    return true;
  }

  public async withdraw(triggerCid: number, amount: number, comment?: string) {
    const isValid = await this.actionValidation('withdraw', triggerCid, amount, { balanceDecrease: true });
    if (!isValid) return false;

    const triggerPlyId = charModule.getServerIdFromCitizenId(triggerCid);
    if (!triggerPlyId) return false;

    amount = parseInt(String(amount));
    this.changeBalance(-amount);
    addCash(triggerPlyId, amount, `Withdraw from ${this.name} (${this.account_id})`);

    await this.addTransaction(this.account_id, this.account_id, triggerCid, amount, amount, 'withdraw', comment);
    Util.Log(
      'financials:withdraw:success',
      {
        cid: triggerCid,
        account: this.account_id,
        amount,
        action: 'withdraw',
        comment,
      },
      `${Util.getName(triggerPlyId)} withdrew ${amount} from ${this.name} (${this.account_id})`,
      triggerPlyId
    );
    this.logger.info(
      `withdraw: success | cid: ${triggerCid} | account: ${this.account_id} | accountBalance: ${this.balance} | amount: ${amount}`
    );
    return true;
  }

  public async transfer(
    targetAccountId: string,
    triggerCid: number,
    acceptorCid: number,
    amount: number,
    comment?: string,
    canBeNegative?: boolean,
    taxId?: number
  ): Promise<boolean> {
    const isValid = await this.actionValidation('transfer', triggerCid, amount, {
      acceptorCid,
      targetAccountId,
      balanceDecrease: true,
      canBeNegative,
    });
    if (!isValid) return false;

    // FIXME: currently the triggerCid may be offline
    let triggerPlyId: number | null = null;
    // triggerPlyId = DGCore.Functions.getPlyIdForCid(triggerCid);
    // if (!triggerPlyId) return false;

    const targetAccount = accountManager.getAccountById(targetAccountId);
    if (!targetAccount) return false;

    // Player should be able to transfer to any1 when not a 2 player interaction
    // Check target cid permissions for target account if transfer and trigger and target not same
    if (acceptorCid !== triggerCid) {
      if (!targetAccount.permsManager.hasAccess(acceptorCid)) {
        Util.Log(
          'financials:missingPermissions',
          {
            cid: triggerCid,
            action: 'transfer',
            origin_account: this.account_id,
            acceptorCid,
            targetAccountId,
          },
          `${triggerCid} tried to transfer ${amount} from ${this.name} (${this.account_id}) to ${targetAccount.name} (accountId: ${targetAccount.account_id} | accepted_by: ${acceptorCid}) but did not have the permissions`
        );
        this.logger.info(`transfer: ${acceptorCid} missing permissions to ${targetAccountId} as acceptor`);
        return false;
      }
    }

    // Target gets price without tax
    amount = parseInt(String(amount));
    targetAccount.changeBalance(amount);

    // Remove price with tax from trigger
    let taxedAmount = amount;
    if (taxId) {
      const { taxPrice } = getTaxedPrice(amount, taxId);
      taxedAmount = taxPrice;
    }
    this.changeBalance(-taxedAmount);

    const transaction = await this.addTransaction(
      this.account_id,
      targetAccountId,
      triggerCid,
      taxedAmount,
      amount,
      'transfer',
      comment,
      acceptorCid !== triggerCid ? acceptorCid : undefined // Only provide acceptorCid if not same as triggercid
    );
    targetAccount.registerTransaction(transaction);

    Util.Log(
      'financials:transfer:success',
      {
        cid: triggerCid,
        acceptor_cid: acceptorCid,
        account: this.account_id,
        targetAccountId,
        amount,
        taxedAmount,
        action: 'transfer',
        comment,
        canBeNegative,
      },
      `${triggerPlyId ? Util.getName(triggerPlyId) : triggerCid} transfer ${amount} from ${this.name} (${
        this.account_id
      }) to ${targetAccount.name} (accountId: ${targetAccount.account_id} | accepted_by: ${acceptorCid})`,
      triggerPlyId ?? triggerCid
    );
    this.logger.info(
      `transfer: success | cid: ${triggerCid} | acceptor_cid: ${acceptorCid} | account: ${this.account_id} | targetAccount: ${targetAccountId} | amount: ${amount}`
    );
    return true;
  }

  public async purchase(triggerCid: number, amount: number, comment?: string, taxId?: number): Promise<boolean> {
    const isValid = await this.actionValidation('purchase', triggerCid, amount, { balanceDecrease: true });
    if (!isValid) return false;

    const triggerPlyId = charModule.getServerIdFromCitizenId(triggerCid);
    if (!triggerPlyId) return false;

    amount = parseInt(String(amount));
    let taxedAmount = amount;
    if (taxId) {
      const { taxPrice } = getTaxedPrice(amount, taxId);
      taxedAmount = taxPrice;
    }
    this.changeBalance(-taxedAmount);

    await this.addTransaction(this.account_id, 'BE1', triggerCid, taxedAmount, amount, 'purchase', comment);
    this.logger.info(`purchase: success | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`);
    Util.Log(
      'financials:purchase:success',
      {
        cid: triggerCid,
        account: this.account_id,
        amount,
        taxedAmount,
        action: 'purchase',
        comment,
      },
      `${Util.getName(triggerPlyId)} made a purchase of ${amount} from ${this.name} (${this.account_id})`,
      triggerPlyId
    );
    return true;
  }

  public async paycheck(triggerCid: number, amount: number): Promise<number> {
    const isValid = await this.actionValidation('paycheck', triggerCid, amount);
    if (!isValid) return 0;

    const triggerPlyId = charModule.getServerIdFromCitizenId(triggerCid);
    if (!triggerPlyId) return 0;

    // Check if standard account
    if (this.accType != 'standard') {
      Notifications.add(triggerPlyId, 'Je kan geen paycheck ontvangen op dit account', 'error');
      Util.Log(
        'financials:invalidAccountType',
        {
          cid: triggerCid,
          account: this.account_id,
          amount,
          action: 'paycheck',
        },
        `${Util.getName(triggerPlyId)} tried to takeout his paycheck of €${amount} in ${this.name} (${
          this.account_id
        }) but the account type is not standard`,
        triggerPlyId,
        true
      );
      this.logger.debug(
        `paycheck: invalid account type | cid: ${triggerCid} | account: ${this.account_id} | accountType: ${this.accType} | amount: ${amount}`
      );
      return 0;
    }

    amount = parseInt(String(amount));
    const { taxPrice } = getTaxedPrice(amount, 4, true);
    this.changeBalance(taxPrice);

    // Origin gets deducted full amount, target gets taxedamount
    await this.addTransaction('BE1', this.account_id, triggerCid, amount, taxPrice, 'paycheck', 'Paycheck');

    Util.Log(
      'financials:paycheck:success',
      {
        cid: triggerCid,
        account: this.account_id,
        amount,
        taxPrice,
        action: 'paycheck',
      },
      `${Util.getName(triggerPlyId)} took out his paycheck of €${amount} into ${this.name} (${this.account_id})`,
      triggerPlyId
    );
    this.logger.info(`paycheck: success | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`);
    return taxPrice;
  }

  public async mobileTransfer(
    targetPhone: string,
    triggerCid: number,
    amount: number,
    comment?: string
  ): Promise<boolean> {
    const isValid = await this.actionValidation('mobile_transaction', triggerCid, amount, {
      targetPhone,
      balanceDecrease: true,
    });
    if (!isValid) return false;

    const triggerPlyId = charModule.getServerIdFromCitizenId(triggerCid);
    if (!triggerPlyId) return false;

    const acceptorCid = (await charModule.getPlayerByPhone(targetPhone))?.citizenid;
    if (!acceptorCid) return false;
    const targetAccount = accountManager.getDefaultAccount(acceptorCid);
    if (!targetAccount) return false;

    const targetAccountId = targetAccount.account_id;
    amount = parseInt(String(amount));
    this.changeBalance(-amount);
    targetAccount.changeBalance(amount);

    // Both accounts get same amount
    const transaction = await this.addTransaction(
      this.account_id,
      targetAccountId,
      triggerCid,
      amount,
      amount,
      'mobile_transaction',
      comment,
      acceptorCid
    );
    targetAccount.registerTransaction(transaction);

    Util.Log(
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
      `${Util.getName(triggerPlyId)} mobile_transaction ${amount} from ${this.name} (${this.account_id}) to ${
        targetAccount.name
      } (accountId: ${targetAccount.account_id} | accepted_by: ${acceptorCid})`,
      triggerPlyId
    );
    this.logger.info(
      `mobile_transaction: success | cid: ${triggerCid} | acceptor_cid: ${acceptorCid} | account: ${this.account_id} | targetAccount: ${targetAccountId} | amount: ${amount}`
    );
    return true;
  }

  // TRANSACITON THINGS
  private getTransactionsArray(type?: TransactionType) {
    const transactionTypes = Object.keys(this.transactions) as TransactionType[];
    const allowedTypes = transactionTypes.filter(t => type === undefined || t === type);
    return allowedTypes.reduce<DB.ITransaction[]>(
      (transactions, transactionType) => [...transactions, ...this.transactions[transactionType]],
      []
    );
  }

  public async getTransactions(source: number, offset: number, type?: TransactionType): Promise<DB.ITransaction[]> {
    try {
      // Check if source player is a valid player
      const cid = Util.getCID(source);

      // Check if the player has permission to view transactions
      if (!this.permsManager.hasPermission(cid, 'transactions')) {
        Notifications.add(Number(source), 'Je hebt geen toegang tot dit', 'error');
        Util.Log(
          'financials:missingPermissions',
          {
            cid: cid,
            action: 'getTransactions',
            account: this.account_id,
          },
          `${Util.getName(source)} tried to fetch transactions for ${this.name} (${
            this.account_id
          }) but did not have the permissions`
        );
        this.logger.info(`getTransactions: missing permissions | src: ${source} | account: ${this.account_id}`);
        return [];
      }

      // Get transactions from already loaded transactions, if less than requested then load more from db
      const allTransactions = this.getTransactionsArray(type);
      let transactionsToShow = allTransactions.slice(offset, offset + config.accounts.transactionLimit);
      if (transactionsToShow.length < config.accounts.transactionLimit) {
        const newTransactions = await this.getTransactionsFromDatabase(
          offset + transactionsToShow.length,
          config.accounts.transactionLimit - transactionsToShow.length,
          type
        );
        transactionsToShow.push(...newTransactions);
      }

      this.logger.debug(
        `getTransactions: success | src: ${source} | account: ${this.account_id} | amount: ${transactionsToShow.length}`
      );
      return sortTransactions(transactionsToShow);
    } catch (e) {
      this.logger.error('Error getting transactions', e);
    }
    return [];
  }

  public doesTransactionExist(id: string): boolean {
    return (this.transactionsIds ?? []).includes(id);
  }

  private async addTransaction(
    originAccountId: string,
    targetAccountId: string,
    trigger_cid: number,
    originChange: number,
    targetChange: number,
    type: TransactionType,
    comment = '',
    acceptor_cid?: number
  ): Promise<DB.ITransaction> {
    const originAccountName = accountManager.getAccountById(originAccountId)?.getName() ?? 'Unknown Account';
    const targetAccountName = accountManager.getAccountById(targetAccountId)?.getName() ?? 'Unknown Account';

    const triggerPlayerData = await charModule.getOfflinePlayer(trigger_cid);
    const triggerName =
      triggerPlayerData !== undefined
        ? `${triggerPlayerData.charinfo.firstname} ${triggerPlayerData.charinfo.lastname}`
        : 'Unknown Person';

    let acceptorName: string | null = null;
    if (acceptor_cid !== undefined) {
      const acceptorPlayerData = await charModule.getOfflinePlayer(acceptor_cid);
      acceptorName =
        acceptorPlayerData !== undefined
          ? `${acceptorPlayerData.charinfo.firstname} ${acceptorPlayerData.charinfo.lastname}`
          : 'Unknown Person';
    }

    const transaction: DB.ITransaction = {
      transaction_id: generateTransactionId(),
      origin_account_id: originAccountId,
      origin_account_name: originAccountName,
      origin_change: originChange,
      target_account_id: targetAccountId,
      target_account_name: targetAccountName,
      target_change: targetChange,
      comment,
      triggered_by: triggerName,
      accepted_by: acceptorName,
      date: Date.now(),
      type,
    };

    this.logger.silly(
      `Adding transaction ${transaction.transaction_id} | ${transaction.origin_account_id} -> ${transaction.target_account_id} | originChange: ${transaction.origin_change} | targetChange: ${transaction.target_change} | type: ${transaction.type} | comment: ${transaction.comment}`
    );
    await this.insertTransactionInDatabase(transaction);
    this.registerTransaction(transaction);
    return transaction;
  }

  // Register transaction to the account
  public registerTransaction(transaction: DB.ITransaction) {
    // Add transaction to front of array
    this.transactions[transaction.type].unshift(transaction);
    this.transactionsIds.push(transaction.transaction_id);
  }

  public setDefaultBalance = async (cid: number) => {
    if (this.balance !== 0) {
      Util.Log(
        'financials:defaultbalance:notZero',
        {
          cid,
          account: this.account_id,
          balance: this.balance,
        },
        `Tried to set default balance for ${this.account_id} but balance was not 0`
      );
      this.logger.silly(`defaultbalance: balance is already at ${this.balance} | cid: ${cid}`);
      return;
    }

    if (this.transactionsIds.length !== 0) {
      Util.Log(
        'financials:defaultbalance:existingTransactions',
        {
          cid,
          account: this.account_id,
          transactionIds: this.transactionsIds,
        },
        `Tried to set default balance for ${this.account_id} but transactions were already made using account`
      );
      this.logger.silly(`defaultbalance: ${this.transactionsIds.length} transactions already exist | cid: ${cid}`);
      return;
    }

    if (this.accType != 'standard') {
      Util.Log(
        'financials:defaultbalance:notStandard',
        {
          cid,
          account: this.account_id,
          accType: this.accType,
        },
        `Tried to set default balance for ${this.account_id} but account was not a standard account but ${this.accType}`
      );
      this.logger.debug(`defaultbalance: invalid account type | accountType: ${this.accType} | cid: ${cid}`);
      return false;
    }

    const defaultBalance = getConfig()?.accounts?.defaultBalance ?? 0;
    if (defaultBalance <= 0) {
      this.logger.silly(`defaultbalance: Setting default balance but setting to 0`);
      return;
    }

    this.changeBalance(defaultBalance);
    await this.addTransaction('BE1', this.account_id, cid, defaultBalance, defaultBalance, 'paycheck', 'Bonus');

    Util.Log(
      'financials:defaultbalance:success',
      {
        cid,
        account: this.account_id,
        defaultBalance,
      },
      `Default balance got set for ${this.account_id} to ${defaultBalance}`
    );
    this.logger.info(`paycheck: success | ${this.account_id} | amount: ${defaultBalance} | cid: ${cid}`);
  };
}
