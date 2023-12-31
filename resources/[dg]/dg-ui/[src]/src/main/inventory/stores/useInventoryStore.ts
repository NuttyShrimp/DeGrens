import { create } from '@src/lib/store';

const initialStore: Inventory.State = {
  items: {},
  inventories: {},
  primaryId: '',
  secondaryId: '',
  holdingSelector: false,
  currentSelectorInventory: null,
  selectedItems: [],
  syncedItemIds: [],
  shopOpen: false,
};

export const useInventoryStore = create<
  Inventory.State & Inventory.StateActions & Store.UpdateStore<Inventory.State> & Store.ResetStore
>('inventory')(set => ({
  ...initialStore,
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
  resetStore: () => set(() => ({ ...initialStore })),
  updateItem: itemState =>
    set(s => {
      const item = typeof itemState === 'function' ? itemState(s.items) : itemState;
      return { items: { ...s.items, [item.id]: item } };
    }),
  deleteItem: id =>
    set(s => {
      const nItems = { ...s.items };
      delete nItems[id];
      return { items: nItems };
    }),
}));
