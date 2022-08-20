import { StoreObject } from '@lib/redux';

const store: StoreObject<Sliders.State> = {
  key: 'sliders',
  initialState: {
    visible: false,
    power: [0, 100],
    amount: [0, 100],
  },
};
export default store;
