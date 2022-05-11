import { StoreObject } from '@lib/redux';

const store: StoreObject<ContextMenu.State> = {
  key: 'contextmenu',
  initialState: {
    visible: false,
    entries: [],
    allEntries: [],
    parentEntry: [],
  },
};
export default store;
