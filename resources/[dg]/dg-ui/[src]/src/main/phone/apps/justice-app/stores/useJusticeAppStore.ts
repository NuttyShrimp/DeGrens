import { create } from '@src/lib/store';

export const useJusticeAppStore = create<Phone.Justice.State>('phone.app.justice')(set => ({
  list: {},
  setList: l => set(() => ({ list: l })),
}));
