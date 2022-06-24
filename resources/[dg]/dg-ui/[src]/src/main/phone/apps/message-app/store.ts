import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Messages.State> = {
  key: 'phone.apps.messages',
  initialState: {
    hasNotification: false,
    messages: {},
    currentNumber: null,
  },
};

export default store;
