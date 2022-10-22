import { StoreObject } from '@lib/redux';

const store: StoreObject<Laptop.Confirm.State> = {
  key: 'laptop.confirm',
  initialState: { data: null },
};

export default store;
