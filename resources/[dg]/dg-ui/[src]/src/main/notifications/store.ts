import { StoreObject } from '@lib/redux';

const store: StoreObject<Notifications.State> = {
  key: 'notifications',
  initialState: {
    visible: true,
    notifications: [],
  },
};
export default store;
