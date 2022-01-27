export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'purchase' | 'paycheck';

export enum TransactionIcon {
	'withdraw' = 'vaadin:money-withdraw',
	'transfer' = 'vaadin:money-exchange',
	'deposit' = 'vaadin:money-deposit',
	'purchase' = 'vaadin:money-withdraw',
	'paycheck' = 'vaadin:money-deposit',
}

export interface ITransaction {
	transaction_id: string;
	origin_account_id: string;
	origin_account_name: string;
	target_account_id: string;
	target_account_name: string;
	change: number;
	comment: string;
	// here Names, serversided this will be the citizenid
	triggered_by: string;
	accepted_by: string;
	// UNIX timestamp
	date: number;
	type: TransactionType;
}
