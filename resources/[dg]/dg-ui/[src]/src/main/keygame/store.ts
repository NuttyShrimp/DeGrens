import { StoreObject } from '@lib/redux';

const store: StoreObject<Keygame.State> = {
  key: 'keygame',
  initialState: {
    visible: false,
    id: '',
    cycles: [],
  },
};

export default store;
