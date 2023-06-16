import { create } from '@src/lib/store';

export const useNotesAppStore = create<Phone.Notes.State>('phone.app.notes')(set => ({
  list: [],
  current: null,
  setList: l => set({ list: l }),
}));
