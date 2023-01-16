import { create } from '@src/lib/store';

export const useTwitterAppStore = create<Phone.Twitter.State & Store.UpdateStore<Phone.Twitter.State>>(
  'phone.app.twitter'
)(set => ({
  tweets: [],
  requestAmount: 0,
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
