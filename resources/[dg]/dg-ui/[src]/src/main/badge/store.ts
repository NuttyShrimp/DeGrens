import { StoreObject } from '@lib/redux';

const store: StoreObject<Badge.State> = {
  key: 'badge',
  initialState: {
    visible: false,
  },
};
export default store;
