import { StoreObject } from '@lib/redux';

const store: StoreObject<Laptop.State, Laptop.AuxState> = {
  key: 'laptop',
  initialState: {
    visible: false,
    activeApps: [],
    notifications: [],
    focusedApp: '',
  },
  auxiliaryState: {
    'laptop.config': {
      config: [],
      enabledApps: [],
    },
  },
};
export default store;
