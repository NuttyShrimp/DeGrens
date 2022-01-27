import { store } from '../store';

export const events: { [k: string]: (data: any) => void } = {};

events['open'] = data => {
	store.commit('setBase', data);
};

events['close'] = data => {
	store.commit('setBase', { open: false });
	store.commit('resetAccountState');
	store.commit('resetModalState');
	store.commit('resetTransactionState');
};
