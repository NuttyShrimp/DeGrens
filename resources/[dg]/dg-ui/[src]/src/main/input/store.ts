import { StoreObject } from '@lib/redux';

const store: StoreObject<InputMenu.State> = {
  key: 'input',
  initialState: {
    visible: false,
  },
};
export default store;
