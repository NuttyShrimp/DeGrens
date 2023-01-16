import { create } from '@src/lib/store';

export const useDebtAppStore = create<Phone.Debt.State & Phone.Debt.StateActions>('phone.app.debt')(set => ({
  list: [],
  setList: l => set(() => ({ list: l })),
}));
