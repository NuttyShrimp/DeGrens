import { Account } from './Account';
import { bankLogger, sortAccounts } from '../utils';
import { config } from '../../../config';
import winston from 'winston';
import { checkPlayerAccounts } from '../controllers/accounts';

export class AccountManager {
	private static _instance: AccountManager;

	public static getInstance(): AccountManager {
		if (!AccountManager._instance) {
			AccountManager._instance = new AccountManager();
		}
		return AccountManager._instance;
	}

	private accounts: Account[] = [];
	private logger: winston.Logger;

	constructor() {
		this.logger = bankLogger.child({ module: 'AccountManager' });
		// fetch accounts from database
		this.logger = bankLogger.child({ module: 'AccountManager' });
		this.getAccountsDB().then(() => {
			this.seedAccounts();
			this.logger.info(`AccountManager: loaded ${this.accounts.length} accounts from database`);
			checkPlayerAccounts();
		});
	}

	//region DB
	public async getAccountIds(cid: number): Promise<string[]> {
		const query = `
			SELECT ba.account_id
			FROM bank_accounts ba
						 INNER JOIN bank_accounts_access baa on ba.account_id = baa.account_id
			WHERE baa.cid = ?
		`;
		const result: string[] = await global.exports.oxmysql.executeSync(query, [cid]);
		return result;
	}

	/**
	 * Get account by accountId. Automatically creates account adds it to the list of accounts.
	 * @param id
	 */
	public async getAccountDB(id: string): Promise<Account> {
		const query = `
			SELECT ba.*,
						 (SELECT JSON_ARRAYAGG(JSON_OBJECT('cid', cid, 'access_level', access_level)) FROM bank_accounts_access WHERE account_id = ba.account_id) as members
			FROM bank_accounts ba
			WHERE ba.account_id = ?
		`;
		const result: DB.IAccount[] = await global.exports.oxmysql.executeSync(query, [id]);
		if (result.length === 0) {
			return null;
		}

		const account = new Account(
			result[0].account_id,
			result[0].name,
			result[0].type,
			result[0].balance,
			JSON.parse(result[0].members)
		);
		this.addAccount(account);
		return account;
	}

	/*
	 * Get all accounts from the database.
	 */
	private async getAccountsDB(): Promise<void> {
		const query = `
			SELECT ba.*,
						 (SELECT JSON_ARRAYAGG(JSON_OBJECT('cid', cid, 'access_level', access_level)) FROM bank_accounts_access WHERE account_id = ba.account_id) as members
			FROM bank_accounts ba
		`;
		const result: DB.IAccount[] = await global.exports.oxmysql.executeSync(query);
		if (!result) return;
		for (const account of result) {
			const newAccount = new Account(
				account.account_id,
				account.name,
				account.type,
				account.balance,
				account.members ? JSON.parse(account.members) : []
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
		for (const a of config.accounts.toSeed) {
			const i = config.accounts.toSeed.indexOf(a);
			// Check if account with id exists
			if (this.accounts.find(acc => acc.getAccountId() === `BE${i + 1}`)) {
				continue;
			}
			const query = `
				INSERT INTO bank_accounts (account_id, name, type, balance)
				VALUES (?, ?, ?, 0)
			`;
			// We use the index here to make it easier to target a seeded account via code
			await global.exports.oxmysql.executeSync(query, [`BE${i + 1}`, a.name, 'business']);
			const account = new Account(`BE${i + 1}`, a.name, 'business', 0, []);
			this.accounts.push(account);
		}
	}
	//endregion
	// region Getters
	public async getAccounts(cid: number, type?: AccountType): Promise<Account[]> {
		const _accounts = this.accounts.filter(account => (!type || account.getType() === type) && account.hasAccess(cid));
		const ids = await this.getAccountIds(cid);
		const filteredIds = ids.filter(id => _accounts.findIndex(account => account.getAccountId() === id) !== -1);
		// Fetch missing accounts
		for (const id of filteredIds) {
			const account = await this.getAccountDB(id);
			if (!account) {
				this.logger.error(`[AccountManager] Could not fetch account | id: ${id} | cid: ${cid}`);
			}
			_accounts.push(account);
		}
		this.logger.silly(`Fetched ${_accounts.length} accounts for cid: ${cid} | type: ${type}`);
		return sortAccounts(_accounts);
	}

	public async getDefaultAccount(cid: number, suppressErr = false): Promise<Account> {
		const accounts = await this.getAccounts(cid, 'standard');
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

	public getAccountById(id: string, isTrans = false): Account {
		return this.accounts.find(account => {
			if (account.getAccountId() !== id) {
				return false;
			}
			if (isTrans) {
				return true;
			}
			const seedAcc = config.accounts.toSeed.find(acc => acc.name === account.getName());
			if (!seedAcc) {
				return true;
			}
			return seedAcc.canTransfer;
		});
	}

	/**
	 * Gets account via accountId, cid(standard account) or businessId(business account)
	 * @param input
	 */
	public async getAccount(input: string): Promise<Account> {
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
		const defaultAccount = await this.getDefaultAccount(numInput);
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
