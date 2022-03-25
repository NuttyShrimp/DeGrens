import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Justice.State> = {
  key: 'phone.apps.justice',
  initialState: {
    list: {},
  },
};

export default store;
