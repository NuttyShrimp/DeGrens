// region Data
import { emulate } from './nui/action';
import { IAccount } from '../types/accounts';
import { ITransaction } from '../types/transactions';

export const devdata: { [k: string]: any } = {};

devdata.initialInfo = {
	open: true,
	bank: 'fleeca',
	cash: 10000,
};

devdata.accounts = [
	{
		account_id: 'BE01234566',
		name: 'Standard',
		balance: -1020.01,
		type: 'standard',
		permissions: {
			deposit: true,
			withdraw: true,
			transfer: true,
			transactions: true,
		},
	},
	{
		account_id: 'BE01234567',
		name: 'Me Savings',
		balance: 1478673.9,
		type: 'savings',
		permissions: {
			deposit: true,
			withdraw: false,
			transfer: false,
			transactions: true,
		},
	},
	{
		account_id: 'BE01234568',
		name: 'Bank of America',
		balance: 67980.12,
		type: 'business',
		permissions: {
			deposit: true,
			withdraw: true,
			transfer: true,
			transactions: false,
		},
	},
] as IAccount[];

devdata.transactions = [
	{
		transaction_id: 'e418e011-54fc-49a6-968a-8e9197c2cb1b',
		origin_account_id: 'BE01234567',
		origin_account_name: 'Me Savings',
		target_account_id: 'BE01234568',
		target_account_name: 'Bank of America',
		change: 100,
		comment: 'Transfer to Bank of America',
		triggered_by: 'David Voor',
		accepted_by: 'David Achter',
		date: 1641766054368,
		type: 'transfer',
	},
] as ITransaction[];

// endregion
// region Emulator
const emulatedEvents: Record<
	string,
	{
		action: string;
		data: any;
		// If true data must be array & event will be triggered for each entry in the data array with the given action & app
		iterateData?: boolean;
	}
> = {};
export const devDataEmulator = () => {
	Object.keys(emulatedEvents).forEach(eventName => {
		const event = emulatedEvents[eventName];
		if (event.iterateData) {
			event.data.forEach((data: any) => {
				emulate(event.action, data);
			});
		} else {
			emulate(event.action, event.data);
		}
		console.log(`Emulated event: ${event.action} (${eventName})`);
	});
};
emulatedEvents.open = {
	action: 'open',
	data: devdata.initialInfo,
};

// endregion
