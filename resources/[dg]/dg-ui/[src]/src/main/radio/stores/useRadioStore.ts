import { create } from '@src/lib/store';

export const useRadioStore = create<Radio.State & Store.UpdateStore<Radio.State>>('radio')(set => ({
  frequency: 0,
  enabled: false,
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
