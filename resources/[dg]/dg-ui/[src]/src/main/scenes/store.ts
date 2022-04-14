import { StoreObject } from '@lib/redux';
import { isDevel } from '@src/lib/env';

const store: StoreObject<Scenes.State> = {
  key: 'scenes',
  initialState: {
    visible: isDevel() ? false : false,
  },
};
export default store;
