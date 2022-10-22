import { StoreObject } from '@lib/redux';

const store: StoreObject<Laptop.Gang.State> = {
  key: 'laptop.gang',
  initialState: {
    name: '',
    label: '',
    members: [],
  },
};

export default store;
