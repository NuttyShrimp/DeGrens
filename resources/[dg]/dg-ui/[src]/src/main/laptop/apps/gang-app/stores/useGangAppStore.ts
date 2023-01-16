import { create } from '@src/lib/store';

export const useGangApp = create<Laptop.Gang.State & Store.UpdateStore<Laptop.Gang.State>>('laptop.gang')(set => ({
  name: '',
  label: '',
  members: [],
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
