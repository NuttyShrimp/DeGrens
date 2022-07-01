import { StoreObject } from '@lib/redux';

const store: StoreObject<Peek.State> = {
  key: 'peek',
  initialState: {
    visible: false,
    entries: [],
    hasTarget: false,
    showList: false,
  },
};
export default store;
