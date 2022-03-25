import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Phone.State> = {
  key: 'phone.apps.phone',
  initialState: {
    calls: [],
  },
};

export default store;
