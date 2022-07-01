import { StoreObject } from '@lib/redux';

const store: StoreObject<Scenes.State> = {
  key: 'sliders',
  initialState: {
    visible: false,
  },
};
export default store;
