import { StoreObject } from '@lib/redux';

const store: StoreObject<Inventory.State> = {
  key: 'inventory',
  initialState: {
    visible: false,
    items: {},
    inventories: {},
    primaryId: '',
    secondaryId: '',
  },
};
export default store;
