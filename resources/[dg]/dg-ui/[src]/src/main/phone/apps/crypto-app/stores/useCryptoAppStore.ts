import { create } from '@src/lib/store';

export const useCryptoAppStore = create<Phone.Crypto.State & Phone.Crypto.StateActions>('phone.app.crypto')(set => ({
  list: [],
  shouldRenew: false,
  setList: l => set(() => ({ list: l })),
  setRenew: should => set(() => ({ shouldRenew: should })),
}));
