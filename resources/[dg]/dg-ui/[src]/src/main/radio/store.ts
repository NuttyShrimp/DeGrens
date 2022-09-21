import { StoreObject } from '@lib/redux';

const store: StoreObject<Radio.State> = {
  key: 'radio',
  initialState: {
    visible: false,
    frequency: 0,
    enabled: false,
  },
};
export default store;
