export interface baseState {
	open: boolean;
	animationFinished: boolean;
	cash: number;
	bank: string;
	isAtm: boolean;
}

const defaultState: baseState = {
	open: false,
	animationFinished: false,
	cash: 0,
	bank: '',
	isAtm: false,
};

export const baseModule = {
	state: defaultState,
	getters: {
		getBaseInfo: (state: baseState) => () => state,
		getBaseValue: (state: baseState) => (key: keyof baseState) => state[key],
	},
	mutations: {
		setBase(state: baseState, info: Partial<baseState>) {
			Object.assign(state, info);
		},
	},
};
