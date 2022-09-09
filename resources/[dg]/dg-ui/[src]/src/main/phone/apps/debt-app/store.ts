import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Debt.State> = {
  key: 'phone.apps.debt',
  initialState: {
    list: [],
  },
};

export default store;
