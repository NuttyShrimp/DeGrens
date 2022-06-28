import { StoreObject } from '@lib/redux';

const store: StoreObject<Notifications.State> = {
  key: 'notifications',
  initialState: {
    visible: true,
    notifications: [],
    lastId: 0,
  },
};
export default store;
