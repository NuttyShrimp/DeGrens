import { create } from '@src/lib/store';

export const useIdListStore = create<IdList.State & IdList.StateActions>('idlist')(set => ({
  current: [],
  recent: [],
  setList: d => set(() => ({ ...d })),
}));
