import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Crypto.State> = {
  key: 'phone.apps.crypto',
  initialState: {
    list: [],
    shouldRenew: false,
  },
};

export default store;
