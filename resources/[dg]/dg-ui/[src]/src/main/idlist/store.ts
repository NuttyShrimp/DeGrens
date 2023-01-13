import { StoreObject } from '@lib/redux';

const store: StoreObject<IdList.State> = {
  key: 'idlist',
  initialState: {
    visible: false,
    current: [],
    recent: [],
  },
};
export default store;
