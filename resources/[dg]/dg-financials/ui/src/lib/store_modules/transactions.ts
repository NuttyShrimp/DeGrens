import { ITransaction } from '../../types/transactions';
import { nuiAction } from '../nui/action';
import { devdata } from '../devdata';

export interface TransactionState {
	list: ITransaction[];
	loaded: boolean;
	canLoadMore: boolean;
}

const defaultState: TransactionState = {
	list: [],
	loaded: false,
	canLoadMore: false,
};

export const transactionState = {
	state: { ...defaultState },
	getters: {
		getTransactionList: (state: TransactionState) => () => state.list,
		isLoaded: (state: TransactionState) => () => state.loaded,
		canLoadMore: (state: TransactionState) => () => state.canLoadMore,
	},
	mutations: {
		setList(state: TransactionState, list: ITransaction[]) {
			state.list = list;
			if (!state.loaded) state.loaded = true;
		},
		appendList(state: TransactionState, list: ITransaction[]) {
			state.list = state.list.concat(list);
			if (!state.loaded) state.loaded = true;
		},
		setCanLoadMore(state: TransactionState, canLoadMore: boolean) {
			state.canLoadMore = canLoadMore;
		},
		resetTransactionState(state: TransactionState) {
			state = Object.assign(state, defaultState);
		},
	},
	actions: {
		async fetchList(context: any, clearList = false) {
			const curAccId: number | null = context.getters.getCurrentAccountId();
			if (!curAccId) return;
			const list = await nuiAction<ITransaction[]>(
				'transactions/get',
				{
					accountId: curAccId,
					loaded: clearList ? 0 : context.state.list.length,
				},
				devdata.transactions
			);
			if (!clearList && list.length === 0) {
				context.commit('setCanLoadMore', false);
			}
			context.commit(clearList ? 'setList' : 'appendList', list);
		},
	},
};
