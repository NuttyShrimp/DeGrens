import { create } from '@src/lib/store';

export const usePayconiqAppStore = create<Phone.PayConiq.State>('phone.app.payconiq')(set => ({
  list: [],
  dirty: false,
  setDirty: dirty => set(() => ({ dirty })),
  setList: list => set(() => ({ list })),
}));
