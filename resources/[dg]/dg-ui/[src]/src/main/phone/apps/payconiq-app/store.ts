import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.PayConiq.State> = {
  key: 'phone.apps.payconiq',
  initialState: {
    list: [],
    dirty: false,
  },
};

export default store;
