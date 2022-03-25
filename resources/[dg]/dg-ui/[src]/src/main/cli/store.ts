import { isDevel } from '@lib/env';
import { StoreObject } from '@lib/redux';

const store: StoreObject = {
  key: 'cli',
  initialState: {
    visible: isDevel(),
  },
};
export default store;
