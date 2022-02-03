import { DefineComponent } from 'vue';

export interface ModalState {
	visible: boolean;
	element: DefineComponent | null;
	props: Record<string, any>;
	checkmark: boolean;
}

const defaultState: ModalState = {
	visible: false,
	element: null,
	props: {},
	checkmark: false,
};

export const modalState = {
	state: { ...defaultState },
	getters: {
		getModalState: (state: ModalState) => () => state,
	},
	mutations: {
		setModalState: (state: ModalState, payload: Partial<ModalState>) => {
			Object.assign(state, payload);
		},
		resetModalState(state: ModalState) {
			state = Object.assign(state, defaultState);
		},
	},
	actions: {
		openModal(context: any, payload: { element: DefineComponent; props: Record<string, any> }) {
			context.commit('setModalState', {
				visible: true,
				element: payload.element,
				props: payload.props,
				checkmark: false,
			});
		},
		closeModal(context: any) {
			context.commit('setModalState', {
				visible: false,
				element: null,
				props: {},
				checkmark: false,
			});
		},
		openCheckmarkModal(context: any, payload?: Function) {
			context.commit('setModalState', {
				visible: false,
				element: null,
				props: {},
				checkmark: true,
			});
			setTimeout(() => {
				context.dispatch('closeModal');
				if (!payload) return;
				payload();
			}, 2000);
		},
	},
};
