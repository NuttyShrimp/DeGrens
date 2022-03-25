import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Gallery.State> = {
  key: 'phone.apps.gallery',
  initialState: {
    list: [],
  },
};

export default store;
