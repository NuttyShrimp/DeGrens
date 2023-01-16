import { create } from '../../../lib/store';

export const useCtxMenuStore = create<ContextMenu.State & ContextMenu.StateActions>('contextmenu')(set => ({
  entries: [],
  allEntries: [],
  parentEntry: [],
  resetEntries: () => set(() => ({ entries: [], allEntries: [], parentEntry: [] })),
  loadEntries: e => set(() => ({ entries: [...e], allEntries: [...e] })),
  setEntries: (ent, parent) => set(() => ({ entries: ent, parentEntry: parent })),
}));
