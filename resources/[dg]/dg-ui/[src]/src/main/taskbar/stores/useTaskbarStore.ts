import { create } from '@src/lib/store';

export const useTaskbarStore = create<TaskBar.State & Store.UpdateStore<TaskBar.State>>('taskbar')(set => ({
  duration: 0,
  label: '',
  icon: '',
  id: '',
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
