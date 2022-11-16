import { StoreObject } from '@lib/redux';

const store: StoreObject<Policeradar.State> = {
  key: 'policeradar',
  initialState: {
    visible: false,
  },
};
export default store;
