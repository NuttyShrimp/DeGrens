import { create } from '@src/lib/store';

export const usePeekStore = create<Peek.State & Store.UpdateStore<Peek.State>>('peek')(set => ({
  entries: [],
  hasTarget: false,
  showList: false,
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
