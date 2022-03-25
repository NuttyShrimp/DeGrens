import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Notes.State> = {
  key: 'phone.apps.notes',
  initialState: {
    list: [],
    current: null,
  },
};

export default store;
