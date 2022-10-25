import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Garage.State> = {
  key: 'phone.apps.garage',
  initialState: {
    list: [],
  },
};

export default store;
