import { StoreObject } from '@lib/redux';
import { devData } from '@src/lib/devdata';
import { isDevel } from '@src/lib/env';

const store: StoreObject<Dispatch.State> = {
  key: 'dispatch',
  initialState: {
    visible: false,
    calls: isDevel() ? devData.dispatchCalls : [],
    storeSize: 20,
    cams: isDevel() ? devData.dispatchCams : [],
  },
};
export default store;
