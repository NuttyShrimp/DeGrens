import { StoreObject } from '@lib/redux';

const store: StoreObject<Laptop.Bennys.State> = {
  key: 'laptop.bennys',
  initialState: {
    activeTab: 'cosmetic',
    items: [],
    cart: {},
  },
};
export default store;
