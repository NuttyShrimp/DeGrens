import { create } from '@src/lib/store';

export const useYPAppStore = create<Phone.YellowPages.State>('phone.app.yellowpages')(set => ({
  list: [],
  current: null,
  setList: ads => set(() => ({ list: ads })),
}));
