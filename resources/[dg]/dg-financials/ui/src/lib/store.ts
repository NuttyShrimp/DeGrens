import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import { baseModule, baseState } from './store_modules/base';
import { accountModule } from './store_modules/account';
import { transactionState } from './store_modules/transactions';
import { modalState } from './store_modules/modal';
import { nuiAction } from './nui/action';
import { devdata } from './devdata';

export interface State {
	base: baseState;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
	actions: {
		refreshAccount: async (context, accId: string) => {
			const _accs = await nuiAction('accounts/get', {}, devdata.accounts);
			context.commit('setAccounts', _accs);
			context.dispatch('fetchList', true);
			const cash = await nuiAction('cash/get');
			context.commit('setBase', { cash });
		},
	},
	modules: {
		base: baseModule,
		account: accountModule,
		transactions: transactionState,
		modal: modalState,
	},
});

export function useStore() {
	return baseUseStore(key);
}
