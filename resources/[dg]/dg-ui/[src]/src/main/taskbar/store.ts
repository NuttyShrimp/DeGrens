import { StoreObject } from '@lib/redux';

const store: StoreObject<TaskBar.State> = {
  key: 'taskbar',
  initialState: {
    visible: false,
    duration: 0,
    label: '',
    icon: '',
    id: '',
  },
};
export default store;
