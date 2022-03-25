import { StoreObject } from '@lib/redux';

import { isDevel } from '../../lib/env';

const store: StoreObject<Phone.State, Phone.AuxState> = {
  key: 'phone',
  initialState: {
    visible: false,
    animating: false,
    isSilent: false,
    inCamera: false,
    callActive: false,
    hasNotifications: false,
    bigPhoto: null,
    activeApp: isDevel() ? 'home-screen' : 'home-screen',
    callMeta: {},
    background: {},
  },
  auxiliaryState: {
    'phone.form': {
      visible: false,
      element: null,
      checkmark: false,
    },
    'phone.notifications': {
      list: [],
    },
  },
};
export default store;
