import { Business, Notifications, SQL, Util } from '@dgx/server';
import { RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { getConfig } from 'helpers/config';
import { scheduleBankTaxes } from 'modules/taxes/service';
import winston from 'winston';

import { createDefaultAccount } from '../helpers/accounts';
import { bankLogger, sortAccounts } from '../utils';

import { Account } from './Account';
import { charModule } from 'helpers/core';

@RPCRegister()
class AccountManager extends Util.Singleton<AccountManager>() {
  private accounts: Account[];
  private readonly logger: winston.Logger;
  public loaded: boolean;
  private seededAccountIds: string[] = [];

  constructor() {
    super();
    this.accounts = [];
    this.loaded = false;
    this.logger = bankLogger.child({ module: 'AccountManager' });
  }

  public async init() {
    this.seededAccountIds = getConfig().accounts.toSeed.map(s => s.id);
    await this.registerAccountsFromDatabase();
    await this.seedAccounts();
    this.logger.info(`loaded ${this.accounts.length} accounts from database`);
    this.loaded = true;

    Object.keys(charModule.getAllPlayers()).forEach(ply => createDefaultAccount(Number(ply))); // Load accounts for players
    scheduleBankTaxes();
  }

  private registerAccount(account: Account): void {
    // Check if account already exists
    if (this.accounts.find(a => a.getAccountId() === account.getAccountId())) {
      this.logger.error(`Account already registered | accountId: ${account.getAccountId()}`);
      return;
    }
    this.accounts.push(account);
  }

  private async registerAccountsFromDatabase() {
    const query = `
			SELECT ba.*,
						 (SELECT JSON_ARRAYAGG(JSON_OBJECT('cid', cid, 'access_level', access_level)) FROM bank_accounts_access WHERE account_id = ba.account_id) as members,
             UNIX_TIMESTAMP(ba.updated_at) * 1000 as updated_at
			FROM bank_accounts ba
		`;
    const result: DB.IAccount[] = await SQL.query(query);
    if (!result) {
      this.logger.error('Failed to fetch accounts from database');
      return;
    }
    for (const account of result) {
      const newAccount = new Account(
        account.account_id,
        account.name,
        account.type,
        account.balance,
        account.members ? JSON.parse(account.members) : [],
        account.updated_at
      );
      this.registerAccount(newAccount);
    }
  }

  private async seedAccounts() {
    const accountsToSeed = getConfig().accounts.toSeed;
    for (const a of accountsToSeed) {
      if (this.accounts.find(acc => acc.getAccountId() === a.id)) continue;

      const query = `
        INSERT INTO bank_accounts (account_id, name, type, balance)
        VALUES (?, ?, ?, 0)
      `;
      await SQL.query(query, [a.id, a.name, 'business']);
      const account = new Account(a.id, a.name, 'business');
      this.registerAccount(account);
    }
  }

  public async createAccount(cid: number, name: string, accType: AccountType) {
    const account = await Account.create(cid, name, accType);
    const accountId = account.getAccountId();
    this.registerAccount(account);
    Util.Log(
      'financials:accountCreated',
      {
        accountId,
        accountName: name,
        accountType: accType,
        owner: cid,
      },
      `A new ${accType} account (${accountId}) has been created`
    );
    this.logger.debug(`Account ${accountId} created for ${cid} with name ${name} and type ${accType}`);
    return account;
  }

  public getAllAcounts() {
    return this.accounts;
  }

  // Get all accounts player has access to
  public getAccountsForCid(cid: number, type?: AccountType): Account[] {
    const accounts = this.accounts.filter(account => (!type || account.getType() === type) && account.hasAccess(cid));
    this.logger.silly(`Fetched ${accounts.length} accounts for cid: ${cid} | type: ${type}`);
    return sortAccounts(accounts);
  }

  public getDefaultAccount(cid: number, suppressErr = false) {
    const accounts = this.getAccountsForCid(cid, 'standard');
    if (accounts.length === 0) {
      if (!suppressErr) this.logger.error(`Could not find default account for cid: ${cid}`);
      return;
    }
    if (accounts.length > 1) {
      this.logger.warn(`Player ${cid} has access to more than one standard account`);
      Util.Log(
        'financials:moreThanOneStandard',
        { cid, accounts: accounts.map(a => a.getContext()) },
        `Player ${cid} has access to more than one standard account`,
        undefined,
        true
      );
    }
    const defaultAccount = accounts[0];
    const ownerCid = defaultAccount.permsManager.getAccountOwner()?.cid;
    if (ownerCid !== cid) {
      this.logger.error(`Player ${cid} is not owner of found default account ${defaultAccount.getAccountId()}`);
      Util.Log(
        'financials:moreThanOneStandard',
        { cid, accounts: accounts.map(a => a.getContext()) },
        `Player ${cid} is not owner of found default account ${defaultAccount.getAccountId()}`,
        undefined,
        true
      );
      return;
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

  public getAccountById(id: string) {
    return this.accounts.find(account => account.getAccountId() === id);
  }

  /**
   * Get the account id associated with the input. Input can be string version of CID, business name or simply an account id (side effect to validate input)
   */
  public getAccountIdByGeneralInput(input: string) {
    // Check if is BE... number
    const accountById = this.getAccountById(input);
    if (accountById) {
      this.logger.silly(`Found account by accountId | id: ${accountById.getAccountId()}`);
      return accountById.getAccountId();
    }

    // Check if its a business name
    const business = Business.getBusinessByName(input);
    if (business) {
      const accountByBusinessName = this.getAccountById(business.info.bank_account_id);
      if (accountByBusinessName) {
        this.logger.silly(`Found account by businessId | id: ${accountByBusinessName.getAccountId()}`);
        return accountByBusinessName.getAccountId();
      }
    }

    // Check CID default account
    const cid = Number(input);
    if (!isNaN(cid)) {
      const defaultAccount = this.getDefaultAccount(cid);
      if (defaultAccount) {
        this.logger.silly(`Found account by CID | id: ${defaultAccount.getAccountId()}`);
        return defaultAccount.getAccountId();
      }
    }

    this.logger.warn(`Could not find account | input: ${input}`);
  }

  //#region Savings accounts
  /**
   * Get savingsaccount that the provided player is owner of
   */
  public getSavingsAccount = (cid: number): Account | undefined => {
    const accounts = this.getAccountsForCid(cid, 'savings') ?? [];
    return accounts.find(a => a.permsManager.getAccountOwner()?.cid === cid);
  };

  @RPCEvent('financials:bank:savings:updatePermissions')
  private _updateSavingsAccountPermission = async (
    src: number,
    accountId: string,
    targetCid: number,
    permissions: IAccountPermission
  ) => {
    const srcCid = Util.getCID(src);
    const account = this.getAccountById(accountId);

    if (account === undefined) {
      this.logger.error(`Could not get account with id ${accountId} to update savingsaccount permissions`);
      return;
    }

    // Check if src is owner
    const ownerCid = account?.permsManager.getAccountOwner()?.cid;
    if (ownerCid !== srcCid) {
      this.logger.silly(
        `Player ${srcCid} tried to update saving account (${accountId}) permissions for account he is not owner of`
      );
      Util.Log(
        'financials:savings:notOwner',
        { plyCid: srcCid, accountId },
        `${Util.getName(
          src
        )} tried to update account permissions for savingsaccount ${accountId} but he is not account owner`,
        src,
        true
      );
      return;
    }

    if (ownerCid === targetCid) {
      Notifications.add(src, 'Je hebt jezelf opgegeven', 'error');
      return;
    }

    // Check if account is savingsacc
    if (account.getType() !== 'savings') {
      this.logger.silly(
        `Player ${srcCid} tried to update account permissions for savingsaccount ${accountId} but account is not of type savings`
      );
      Util.Log(
        'financials:savings:notOwner',
        { plyCid: srcCid, accountId, type: account.getType() },
        `${Util.getName(
          src
        )} tried to update account permissions for savingsaccount ${accountId} but account is not of type savings`,
        src,
        true
      );
      return;
    }

    // Check if targetCid exists
    const targetPlayer = await charModule.getOfflinePlayer(targetCid);
    if (targetPlayer == undefined) {
      Notifications.add(src, 'Er is niemand met deze CID!', 'error');
      return;
    }

    this.logger.silly(`Updating permissions for savings account ${accountId} for player ${targetCid}`);
    const level = account.permsManager.buildAccessLevel(permissions);

    // If cid has no perms, then remove perms
    if (level === 0) {
      account.permsManager.removePermissions(targetCid);
      return;
    }

    account.permsManager.addPermissions(targetCid, level);
  };
  //#endregion

  public getSeededAccountIds = () => this.seededAccountIds;
}

const accountManager = AccountManager.getInstance();
export default accountManager;
