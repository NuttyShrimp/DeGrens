import { StoreObject } from '@lib/redux';

const store: StoreObject<Itemboxes.State> = {
  key: 'itemboxes',
  initialState: {
    visible: true,
    itemboxes: [],
  },
};
export default store;
