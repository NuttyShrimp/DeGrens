import { IAccount } from '../../types/accounts';

export interface AccountState {
	list: IAccount[];
	current: IAccount | null;
}

const defaultState: AccountState = {
	list: [],
	current: null,
};

export const accountModule = {
	state: { ...defaultState },
	getters: {
		getAccounts: (state: AccountState) => () => state.list,
		getCurrentAccountId: (state: AccountState) => () => {
			if (state.current) {
				return state.current.account_id;
			}
			return null;
		},
		canSeeTransactions: (state: AccountState) => () => {
			if (state.current) {
				return state.current?.permissions?.transactions ?? false;
			}
			return false;
		},
	},
	mutations: {
		setAccounts: (state: AccountState, payload: IAccount[]) => {
			state.list = payload;
		},
		setCurrentAccount: (state: AccountState, payload: IAccount | null) => {
			state.current = payload;
		},
		resetAccountState(state: AccountState) {
			state = Object.assign(state, defaultState);
		},
	},
};
