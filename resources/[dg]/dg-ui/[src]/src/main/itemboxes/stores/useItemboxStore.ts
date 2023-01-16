import { create } from '@src/lib/store';

export const useItemBoxStore = create<Itemboxes.State & Store.UpdateStore<Itemboxes.State>>('itemboxes')(set => ({
  itemboxes: [],
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
