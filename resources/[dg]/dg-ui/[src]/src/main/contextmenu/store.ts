import { StoreObject } from '@lib/redux';

const store: StoreObject<ContextMenu.State> = {
  key: 'contextmenu',
  initialState: {
    visible: true,
    entries: [],
    allEntries: [],
    parentEntry: [],
  },
};
export default store;
