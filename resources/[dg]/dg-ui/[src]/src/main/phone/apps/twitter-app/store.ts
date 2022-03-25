import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Twitter.State> = {
  key: 'phone.apps.twitter',
  initialState: {
    tweets: [],
    requestAmount: 0,
  },
};

export default store;
