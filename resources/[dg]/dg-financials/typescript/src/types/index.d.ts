declare type AccountType = 'standard' | 'savings' | 'business';
declare type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'purchase' | 'paycheck';

declare interface BaseState {
	open: boolean;
	cash: number;
	bank: string;
	isAtm?: boolean;
}

declare interface IAccountPermission {
	deposit: boolean;
	withdraw: boolean;
	transfer: boolean;
	transactions: boolean;
}

interface IAccount {
	account_id: string;
	name: string;
	type: AccountType;
	balance: number;
	permissions: IAccountPermission;
}

declare interface ITransaction {
	transaction_id: string;
	origin_account_id: string;
	origin_account_name: string;
	target_account_id: string;
	target_account_name: string;
	change: number;
	comment: string;
	// represents CID of user on server, client its full name
	triggered_by: number | string;
	accepted_by: number | string;
	// UNIX timestamp
	date: number;
	type: TransactionType;
}
