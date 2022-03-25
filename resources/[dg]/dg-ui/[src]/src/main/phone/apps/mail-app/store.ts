import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Mail.State> = {
  key: 'phone.apps.mail',
  initialState: {
    mails: [],
  },
};

export default store;
