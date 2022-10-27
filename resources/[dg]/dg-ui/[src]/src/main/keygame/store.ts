import { StoreObject } from '@lib/redux';

const store: StoreObject<Keygame.State> = {
  key: 'keygame',
  initialState: {
    visible: false,
    id: '',
    keys: {},
    cycles: [],
  },
};

export default store;
