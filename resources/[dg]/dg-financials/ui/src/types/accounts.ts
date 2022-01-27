export type AccountType = 'standard' | 'savings' | 'business';

export interface IAccountPermission {
	deposit: boolean;
	withdraw: boolean;
	transfer: boolean;
	transactions: boolean;
}

export interface IAccount {
	account_id: string;
	name: string;
	type: AccountType;
	balance: number;
	permissions: IAccountPermission;
}

export enum AccountIcon {
	standard = 'coins',
	savings = 'piggy-bank',
	business = 'briefcase',
}
