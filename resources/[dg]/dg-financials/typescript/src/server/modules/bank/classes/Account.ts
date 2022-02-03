import { generateAccountId, generateTransactionId } from '../../../sv_util';
import { config } from '../../../config';
import { AccountManager } from './AccountManager';
import { addCash, removeCash } from '../../cash/service';
import { bankLogger } from '../utils';
import { AccountPermissionValue } from '../../../sv_constant';
import winston from 'winston';

export class Account {
	private readonly account_id: string;
	private readonly name: string;
	private readonly accType: AccountType;
	private balance: number;
	private members: IAccountMember[];
	private transactions: DB.ITransaction[] = [];
	private transactionsIds: string[];
	private manager: AccountManager;
	private logger: winston.Logger;

	constructor(account_id: string, name: string, type: AccountType, balance = 0, members: IAccountMember[] = []) {
		this.account_id = account_id;
		this.name = name;
		this.accType = type;
		this.balance = balance;
		this.members = members;
		this.manager = AccountManager.getInstance();
		this.logger = bankLogger.child({ module: account_id });
		this.logger.silly(
			`Account ${this.account_id} created | name: ${this.name} | accountType: ${this.accType} | balance: ${this.balance}`
		);
		this.getPermissions();
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
			VALUES (?, ?, ?)
			RETURNING *
		`;
		await global.exports.oxmysql.executeSync(query, [accId, name, accType]);
		const _account = new Account(accId, name, accType);
		_account.addPermissions(cid, 15);
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
		const perm = this.members.find(member => member.cid === cid);
		this.logger.silly(`getClientVersion | cid: ${cid} | perm: ${perm.access_level}`);
		return {
			account_id: this.account_id,
			name: this.name,
			type: this.accType,
			balance: this.balance,
			permissions: this.buildPermissions(perm?.access_level ?? 0),
		};
	}

	// endregion
	//region Setters
	public changeBalance(amount: number): void {
		this.logger.info(`changeBalance | amount: ${amount}`);
		this.balance += amount;
	}

	// endregion
	//region DB
	private async getPermissions(): Promise<void> {
		const query = `
			SELECT cid,
						 access_level
			FROM bank_accounts_access
			WHERE account_id = ?
		`;
		const result: IAccountMember[] = await global.exports.oxmysql.executeSync(query, [this.account_id]);
		if (!result || !result.length) return;
		result.forEach(row => {
			// Check if the member is already in the members array
			const member = this.members.find(m => m.cid === row.cid);
			if (member) {
				member.access_level = row.access_level;
				return;
			}
			this.members.push({
				cid: row.cid,
				access_level: row.access_level,
			});
		});
	}

	// region Permissions
	public hasAccess(cid: number): boolean {
		const inArray = this.members.some(member => member.cid === cid);
		this.logger.debug(`hasAccess | cid: ${cid} | inArray: ${inArray}`);
		return inArray;
	}

	private async updateBalance(): Promise<void> {
		const query = `
			UPDATE bank_accounts
			SET balance = ?
			WHERE account_id = ?
		`;
		await global.exports.oxmysql.executeSync(query, [this.balance, this.account_id]);
	}

	private async AddDBTransaction(transaction: DB.ITransaction): Promise<void> {
		const query = `
			INSERT INTO transaction_log
			(transaction_id, origin_account_id, target_account_id, \`change\`, comment, triggered_by, accepted_by, date, type)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`;
		await global.exports.oxmysql.executeSync(query, [
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
		this.transactions.unshift(transaction);
		this.sortTransactions();
		this.transactionsIds.push(transaction.transaction_id);
		this.updateBalance();
	}

	public hasPermission(cid: number, permission: AccountPermission): boolean {
		const member = this.members.find(member => member.cid === cid);
		if (!member) {
			this.logger.debug(`hasPermission: not in members array | cid: ${cid}`);
			return false;
		}
		const perms = this.buildPermissions(member.access_level);
		this.logger.info(`hasPermission | cid: ${cid} | ${permission}: ${perms[permission]}`);
		return perms[permission];
	}

	private async getDBTransactionsIds(): Promise<string[]> {
		const query = `
			SELECT DISTINCT transaction_id
			FROM transaction_log
			WHERE origin_account_id = ?
				 OR target_account_id = ?
			ORDER BY date DESC
		`;
		const transactions: string[] = await global.exports.oxmysql.executeSync(query, [this.account_id, this.account_id]);
		return transactions;
	}

	// endregion

	public addPermissions(cid: number, permissions: IAccountPermission | number): void {
		let accessLevel = 0;
		if (typeof permissions === 'number') {
			accessLevel = permissions;
		} else {
			for (const permission in permissions) {
				if (!permissions[permission as keyof IAccountPermission]) continue;
				accessLevel |= AccountPermissionValue[permission as keyof IAccountPermission];
			}
		}
		// Check if the user already has access
		const member = this.members.find(member => member.cid === cid);
		this.updatePermission(cid, accessLevel);
		if (member) {
			this.logger.info(`addPermissions: update perms | cid: ${cid} | accessLevel: ${accessLevel}`);
			member.access_level = accessLevel;
			return;
		}
		this.logger.info(`addPermissions: adding perms | cid: ${cid} | accessLevel: ${accessLevel}`);
		this.members.push({
			cid,
			access_level: accessLevel,
		});
	}

	// region Actions
	public async deposit(triggerCid: number, amount: number, comment?: string) {
		const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		amount = parseInt(String(amount));
		if (!triggerPlayer) {
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidPlayer',
				{
					cid: triggerCid,
					action: 'deposit',
					account: this.account_id,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to deposit ${amount} to ${this.name} (${this.account_id}) but was not found in the core as a valid player`
			);
			this.logger.warn(
				`deposit: invalid player | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			return;
		}
		if (!this.hasPermission(triggerCid, 'deposit')) {
			emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, "You don't have the permissions for this", 'error');
			global.exports['dg-logs'].createGraylogEntry(
				'financials:missingPermissions',
				{
					cid: triggerCid,
					action: 'deposit',
					account: this.account_id,
				},
				`${triggerPlayer.PlayerData.name} tried to deposit ${amount} to ${this.name} (${this.account_id}) but did not have the permissions`
			);
			this.logger.info(
				`deposit: missing permissions | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			// TODO add some anti-cheat measures
			return;
		}
		if (amount <= 0) {
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidAmount',
				{
					cid: triggerCid,
					action: 'deposit',
					account: this.account_id,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to deposit ${amount} to ${this.name} (${this.account_id}) but gave an invalid amount`
			);
			this.logger.info(
				`deposit: invalid amount | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			return;
		}
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
		const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		amount = parseInt(String(amount));
		if (!triggerPlayer) {
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidPlayer',
				{
					cid: triggerCid,
					action: 'withdraw',
					account: this.account_id,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to withdraw ${amount} of ${this.name} (${this.account_id}) but was not found in the core as a valid player`
			);
			this.logger.warn(
				`withdraw: invalid player | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			return;
		}
		if (!this.hasPermission(triggerCid, 'withdraw')) {
			emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, "You don't have the permissions for this", 'error');
			global.exports['dg-logs'].createGraylogEntry(
				'financials:missingPermissions',
				{
					cid: triggerCid,
					action: 'withdraw',
					account: this.account_id,
				},
				`${triggerPlayer.PlayerData.name} tried to withdraw ${amount} of ${this.name} (${this.account_id}) but did not have the permissions`
			);
			this.logger.info(
				`withdraw: missing permissions | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			// TODO add some anti-cheat measures
			return;
		}
		if (amount <= 0) {
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidAmount',
				{
					cid: triggerCid,
					action: 'withdraw',
					account: this.account_id,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to withdraw ${amount} of ${this.name} (${this.account_id}) but gave an invalid amount`
			);
			this.logger.info(
				`withdraw: invalid amount | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			return;
		}
		if (amount > this.balance) {
			emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, `Account balance is to low!`, 'error');
			this.logger.debug(
				`withdraw: amount higher than account balance | cid: ${triggerCid} | account: ${this.account_id} | accountBalance: ${this.balance} | amount: ${amount}`
			);
			return;
		}
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

	public buildPermissions(level: number): IAccountPermission {
		const permissions: IAccountPermission = {
			deposit: false,
			withdraw: false,
			transfer: false,
			transactions: false,
		};
		try {
			Object.keys(AccountPermissionValue).forEach(key => {
				if (level & AccountPermissionValue[key as keyof IAccountPermission]) {
					permissions[key as keyof IAccountPermission] = true;
				}
			});
		} catch (e) {
			this.logger.error(`Error building permissions for account ${this.account_id}`, e);
		}
		this.logger.debug(`buildPermissions | level: ${level} | permissions: ${JSON.stringify(permissions)}`);
		return permissions;
	}

	//endregion

	public async transfer(
		targetAccountId: string,
		triggerCid: number,
		acceptorCid: number,
		amount: number,
		comment?: string,
		canBeNegative = false
	): Promise<boolean> {
		const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		const targetAccount = this.manager.getAccountById(targetAccountId);
		amount = parseInt(String(amount));

		let acceptorPlayer = triggerPlayer;
		if (triggerCid != acceptorCid) {
			acceptorPlayer = DGCore.Functions.GetPlayerByCitizenId(acceptorCid);
		}
		if (!triggerPlayer || (acceptorCid && !acceptorPlayer)) {
			const invalidPly = !triggerPlayer ? triggerCid : acceptorCid;
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidPlayer',
				{
					cid: triggerCid,
					acceptor_cid: acceptorCid,
					action: 'transfer',
					origin_account: this.account_id,
					target_account: targetAccountId,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to transfer ${amount} from ${this.name} (${this.account_id}) to ${targetAccount.name} (accountId: ${targetAccount.account_id} | accepted_by: ${acceptorCid}) but ${invalidPly} was not found in the core as a valid player`
			);
			this.logger.warn(
				`transfer: invalid player | cid: ${triggerCid} | acceptor_cid: ${acceptorCid} | account: ${this.account_id} | target_account: ${targetAccountId} | amount: ${amount}`
			);
			return false;
		}
		if (!this.hasPermission(triggerCid, 'transfer')) {
			emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, "You don't have the permissions for this", 'error');
			global.exports['dg-logs'].createGraylogEntry(
				'financials:missingPermissions',
				{
					cid: triggerCid,
					acceptor_cid: acceptorCid,
					action: 'transfer',
					origin_account: this.account_id,
					target_account: targetAccountId,
				},
				`${triggerPlayer.PlayerData.name} tried to transfer ${amount} from ${this.name} (${this.account_id}) to ${targetAccount.name} (accountId: ${targetAccount.account_id} | accepted_by: ${acceptorCid}) but did not have the permissions`
			);
			this.logger.info(
				`transfer: missing permissions | cid: ${triggerCid} | account: ${this.account_id} | targetAccount: ${targetAccountId} | amount: ${amount}`
			);
			// TODO add some anti-cheat measures
			return false;
		}
		if (!targetAccount.hasPermission(acceptorCid, 'transfer')) {
			emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, "You don't have the permissions for this", 'error');
			global.exports['dg-logs'].createGraylogEntry(
				'financials:missingPermissions',
				{
					cid: triggerCid,
					acceptor_cid: acceptorCid,
					action: 'transfer',
					origin_account: this.account_id,
					target_account: targetAccountId,
				},
				`${triggerPlayer.PlayerData.name} tried to transfer ${amount} from ${this.name} (${this.account_id}) to ${targetAccount.name} (accountId: ${targetAccount.account_id} | accepted_by: ${acceptorCid}) but did not have the permissions`
			);
			this.logger.info(
				`transfer: missing permissions | cid: ${triggerCid} | account: ${this.account_id} | targetAccount: ${targetAccountId} | amount: ${amount}`
			);
			// TODO add some anti-cheat measures
			return false;
		}
		if (amount <= 0) {
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidAmount',
				{
					cid: triggerCid,
					acceptor_cid: acceptorCid,
					action: 'transfer',
					origin_account: this.account_id,
					target_account: targetAccountId,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to transfer ${amount} from ${this.name} (${this.account_id}) to ${targetAccount.name} (accountId: ${targetAccount.account_id} | accepted_by: ${acceptorCid}) but gave an invalid amount`
			);
			this.logger.info(
				`transfer: invalid amount | cid: ${triggerCid} | account: ${this.account_id} | targetAccount: ${targetAccountId} | amount: ${amount}`
			);
			return false;
		}
		if (amount > this.balance && !canBeNegative) {
			emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, `Account balance is to low!`, 'error');
			this.logger.debug(
				`withdraw: amount higher than account balance | cid: ${triggerCid} | account: ${this.account_id} | accountBalance: ${this.balance} | amount: ${amount}`
			);
			return false;
		}
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
		const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		amount = parseInt(String(amount));
		if (!triggerPlayer) {
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidPlayer',
				{
					cid: triggerCid,
					action: 'purchase',
					account: this.account_id,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to make a purchase for ${amount} of ${this.name} (${this.account_id}) but was not found in the core as a valid player`
			);
			this.logger.warn(
				`purchase: invalid player | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			return false;
		}
		if (!this.hasPermission(triggerCid, 'withdraw')) {
			emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, "You don't have the permissions for this", 'error');
			global.exports['dg-logs'].createGraylogEntry(
				'financials:missingPermissions',
				{
					cid: triggerCid,
					action: 'purchase',
					origin_account: this.account_id,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to make a purchase of €${amount} from ${this.name} (${this.account_id}) but did not have the permissions`
			);
			this.logger.info(
				`purchase: missing permissions | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			// TODO add some anti-cheat measures
			return false;
		}
		if (this.accType != 'standard') {
			emitNet(
				'DGCore:Notify',
				triggerPlayer.PlayerData.source,
				'This account accType does not support purchases',
				'error'
			);
			this.logger.debug(
				`purchase: invalid account type | cid: ${triggerCid} | account: ${this.account_id} | accountType: ${this.accType} | amount: ${amount}`
			);
			return false;
		}
		if (amount <= 0) {
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidAmount',
				{
					cid: triggerCid,
					action: 'purchase',
					account: this.account_id,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to make a purchase for ${amount} of ${this.name} (${this.account_id}) but gave an invalid amount`
			);
			this.logger.info(
				`purchase: invalid amount | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			return false;
		}
		if (amount > this.balance) {
			emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, `Account balance is to low!`, 'error');
			this.logger.debug(
				`purchase: amount higher than account balance | cid: ${triggerCid} | account: ${this.account_id} | accountBalance: ${this.balance} | amount: ${amount}`
			);
			return false;
		}
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
		const triggerPlayer = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		amount = parseInt(String(amount));
		if (!triggerPlayer) {
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidPlayer',
				{
					cid: triggerCid,
					account: this.account_id,
					amount,
					action: 'paycheck',
				},
				`${triggerPlayer.PlayerData.name} tried to takeout his paycheck of €${amount} in ${this.name} (${this.account_id}) but was not found in the core as a valid player`
			);
			this.logger.warn(
				`paycheck: invalid player | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			return false;
		}
		if (!this.hasPermission(triggerCid, 'deposit')) {
			emitNet('DGCore:Notify', triggerPlayer.PlayerData.source, "You don't have the permissions for this", 'error');
			global.exports['dg-logs'].createGraylogEntry(
				'financials:missingPermissions',
				{
					cid: triggerCid,
					action: 'paycheck',
					origin_account: this.account_id,
					amount,
				},
				`${triggerPlayer.PlayerData.name} tried to make a deposit a paycheck of €${amount} to ${this.name} (${this.account_id}) but did not have the permissions`
			);
			this.logger.info(
				`paycheck: missing permissions | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
			);
			// TODO add some anti-cheat measures
			return false;
		}
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
		if (amount <= 0) {
			global.exports['dg-logs'].createGraylogEntry(
				'financials:invalidAmount',
				{
					cid: triggerCid,
					account: this.account_id,
					amount,
					action: 'paycheck',
				},
				`${triggerPlayer.PlayerData.name} tried to takeout his paycheck of €${amount} in ${this.name} (${this.account_id}) but gave an invalid amount`
			);
			this.logger.info(
				`paycheck: invalid amount | cid: ${triggerCid} | account: ${this.account_id} | amount: ${amount}`
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

	private async updatePermission(cid: number, access_level: number): Promise<void> {
		const query = `
			INSERT INTO bank_accounts_access
				(account_id, cid, access_level)
			VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE access_level = ?
		`;
		await global.exports.oxmysql.executeSync(query, [this.account_id, cid, access_level, access_level]);
	}

	private async getDBTransactions(
		offset: number,
		limit = config.accounts.transactionLimit
	): Promise<DB.ITransaction[]> {
		const query = `
			SELECT *
			FROM transaction_log
			WHERE origin_account_id = ?
				 OR target_account_id = ?
			ORDER BY date DESC
			LIMIT ?, ?
		`;
		const transactions: DB.ITransaction[] = await global.exports.oxmysql.executeSync(query, [
			this.account_id,
			this.account_id,
			offset,
			limit,
		]);
		this.transactions.push(...transactions);
		this.sortTransactions();
		return transactions;
	}

	// endregion
	// region Transactions
	private sortTransactions(trans: DB.ITransaction[] = this.transactions, custom = false): any {
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
		this.transactions = trans;
	}

	public async getTransactions(source: number | string, offset: number): Promise<ITransaction[]> {
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
			if (!this.hasPermission(Player.PlayerData.citizenid, 'transactions')) {
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
			let dbTransactions = this.transactions.slice(offset, offset + config.accounts.transactionLimit);
			if (dbTransactions.length < config.accounts.transactionLimit) {
				const _trans = await this.getDBTransactions(
					offset + dbTransactions.length,
					config.accounts.transactionLimit - dbTransactions.length
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
