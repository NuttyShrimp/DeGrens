import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { create } from '@src/lib/store';

export const useDebtAppStore = create<Phone.Debt.State & Phone.Debt.StateActions>('phone.app.debt')(set => ({
  list: [],
  fetchDebts: async () => {
    const debts = await nuiAction<Phone.Debt.Debt[]>('phone/debts/get', {}, devData.phoneDebtEntry);
    set(() => ({ list: debts }));
  },
  setList: l => set(() => ({ list: l })),
}));
