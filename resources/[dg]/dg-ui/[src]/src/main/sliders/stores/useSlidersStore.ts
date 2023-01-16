import { create } from '@src/lib/store';

export const useSlidersStore = create<Sliders.State & Store.UpdateStore<Sliders.State>>('sliders')(set => ({
  power: [0, 100],
  amount: [0, 100],
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
