import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.YellowPages.State> = {
  key: 'phone.apps.yellowpages',
  initialState: {
    list: [],
    current: null,
  },
};

export default store;
