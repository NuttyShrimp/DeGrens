import { StoreObject } from '@lib/redux';

const store: StoreObject<ContextMenu.State> = {
  key: 'contextmenu',
  initialState: {
    visible: true,
    entries: [],
    allEntries: [],
    parentEntry: null,
  },
};
export default store;
