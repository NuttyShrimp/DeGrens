import { create } from '@src/lib/store';

export const usePhoneStore = create<Phone.State & Store.UpdateStore<Phone.State>>('phone')(set => ({
  visible: false,
  animating: 'closed',
  isSilent: false,
  inCamera: false,
  callActive: false,
  hasNotifications: false,
  bigPhoto: null,
  activeApp: 'home-screen',
  callMeta: {},
  background: {},
  appNotifications: [],
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
