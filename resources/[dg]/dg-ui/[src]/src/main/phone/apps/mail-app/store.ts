import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Mail.State> = {
  key: 'phone.apps.mail',
  initialState: {
    hasNotification: false,
    mails: [],
  },
};

export default store;
