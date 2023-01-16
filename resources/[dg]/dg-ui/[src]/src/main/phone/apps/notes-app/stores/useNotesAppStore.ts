import { create } from '@src/lib/store';

export const useNotesAppStore = create<Phone.Notes.State>('phone.app.notes')(() => ({
  list: [],
  current: null,
  setList: l => ({ list: l }),
}));
