import { SQL } from '@dgx/server';
import { scheduleBankTaxes } from 'modules/taxes/service';
import winston from 'winston';

import { checkPlayerAccounts } from '../controllers/accounts';
import { bankLogger, sortAccounts } from '../utils';

import { Account } from './Account';

export class AccountManager {
  private static _instance: AccountManager;

  public static getInstance(): AccountManager {
    if (!AccountManager._instance) {
      AccountManager._instance = new AccountManager();
    }
    return AccountManager._instance;
  }

  private config: Config['accounts'];
  private accounts: Account[] = [];
  private logger: winston.Logger;
  loaded: boolean;

  constructor() {
    this.config = null;
    this.loaded = false;
    this.logger = bankLogger.child({ module: 'AccountManager' });
  }

  public async setConfig(config: Config['accounts']) {
    this.config = config;
    await this.getAccountsDB();
    this.loaded = true;
    this.seedAccounts();
    this.logger.info(`AccountManager: loaded ${this.accounts.length} accounts from database`);
    checkPlayerAccounts();
    scheduleBankTaxes();
  }

  //region DB
  public async getAccountIds(cid: number): Promise<string[]> {
    const query = `
			SELECT ba.account_id
			FROM bank_accounts ba
						 INNER JOIN bank_accounts_access baa on ba.account_id = baa.account_id
			WHERE baa.cid = ?
		`;
    const result: string[] = await SQL.query(query, [cid]);
    return result;
  }

  /*
   * Get all accounts from the database.
   */
  private async getAccountsDB(): Promise<void> {
    const query = `
			SELECT ba.*,
						 (SELECT JSON_ARRAYAGG(JSON_OBJECT('cid', cid, 'access_level', access_level)) FROM bank_accounts_access WHERE account_id = ba.account_id) as members,
             UNIX_TIMESTAMP(ba.updated_at) * 1000 as updated_at
			FROM bank_accounts ba
		`;
    const result: DB.IAccount[] = await SQL.query(query);
    if (!result) return;
    for (const account of result) {
      const newAccount = new Account(
        account.account_id,
        account.name,
        account.type,
        account.balance,
        account.members ? JSON.parse(account.members) : [],
        account.updated_at
      );
      this.addAccount(newAccount);
    }
  }
  //endregion
  //region Actions
  public async createAccount(cid: number, name: string, accType: AccountType): Promise<string> {
    const _account = await Account.create(cid, name, accType);
    this.accounts.push(_account);
    return _account.getAccountId();
  }

  private async seedAccounts(): Promise<void> {
    for (const a of this.config.toSeed) {
      // Check if account with id exists
      if (this.accounts.find(acc => acc.getAccountId() === a.id)) {
        continue;
      }
      const query = `
				INSERT INTO bank_accounts (account_id, name, type, balance)
				VALUES (?, ?, ?, 0)
			`;
      // We use the index here to make it easier to target a seeded account via code
      await SQL.query(query, [a.id, a.name, 'business']);
      const account = new Account(a.id, a.name, 'business', 0, []);
      this.accounts.push(account);
    }
  }
  //endregion
  // region Getters
  /**
   * Get all registerd accounts (Do not regularly use this, contains alot of data)
   */
  public getAllAcounts() {
    return this.accounts;
  }
  public getAccounts(cid: number, type?: AccountType): Account[] {
    const _accounts = this.accounts.filter(account => (!type || account.getType() === type) && account.hasAccess(cid));
    this.logger.silly(`Fetched ${_accounts.length} accounts for cid: ${cid} | type: ${type}`);
    return sortAccounts(_accounts);
  }

  public getDefaultAccount(cid: number, suppressErr = false): Account {
    const accounts = this.getAccounts(cid, 'standard');
    const defaultAccount = accounts[0];
    if (!defaultAccount) {
      if (!suppressErr) {
        this.logger.error(`[AccountManager] Could not find default account for cid: ${cid}`);
      }
      return null;
    }
    this.logger.silly(`Fetched default account for cid: ${cid} | id: ${defaultAccount.getAccountId()}`);
    return defaultAccount;
  }

  public doesTransactionExist(id: string): boolean {
    // Loop through all accounts and return true if transaction exists
    for (const account of this.accounts) {
      if (account.doesTransactionExist(id)) {
        return true;
      }
    }
    return false;
  }

  public getAccountById(id: string): Account {
    return this.accounts.find(account => account.getAccountId() === id);
  }

  /**
   * Gets account via accountId, cid(standard account) or businessId(business account)
   * @param input
   */
  public getAccount(input: string): Account {
    this.logger.silly(`Getting account | input: ${input}`);
    const account = this.getAccountById(input);
    if (account) {
      this.logger.silly(`Found account by accountId | id: ${account.getAccountId()}`);
      return account;
    }
    const numInput = Number(input);
    if (isNaN(numInput)) {
      return null;
    }
    const defaultAccount = this.getDefaultAccount(numInput);
    if (defaultAccount) {
      this.logger.silly(`Found account by CID | id: ${defaultAccount.getAccountId()}`);
      return defaultAccount;
    }
    // TODO add business logic when resource is written
    return null;
  }
  //endregion
  //region Private Methods
  private addAccount(account: Account): void {
    // Check if account already exists
    if (this.accounts.find(a => a.getAccountId() === account.getAccountId())) {
      this.logger.error(`[AccountManager] Account already registered | accountId: ${account.getAccountId()}`);
    }
    this.accounts.push(account);
  }

  //endregion
}

export const accountManager = AccountManager.getInstance();
