import { StoreObject } from '@lib/redux';
import { isDevel } from '@src/lib/env';

const store: StoreObject<Scenes.State> = {
  key: 'sliders',
  initialState: {
    visible: isDevel(),
  },
};
export default store;
