import { isDevel } from '@lib/env';
import { StoreObject } from '@lib/redux';

const store: StoreObject<DebugLogs.State> = {
  key: 'debuglogs',
  initialState: {
    visible: isDevel(),
    logs: [],
  },
};
export default store;
