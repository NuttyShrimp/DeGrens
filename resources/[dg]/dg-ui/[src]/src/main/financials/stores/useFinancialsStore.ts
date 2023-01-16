import { Loader } from '@src/components/util';
import { create } from '@src/lib/store';

const initialState: Financials.State = {
  openPane: false,
  cash: 0,
  bank: '',
  isAtm: false,
  canLoadMore: false,
  accounts: [],
  selected: null,
  transactions: [],
  backdrop: false,
  modalComponent: null,
};

export const useFinancialsStore = create<
  Financials.State & Financials.StateActions & Store.ResetStore & Store.UpdateStore<Financials.State>
>('financials')(set => ({
  ...initialState,
  resetStore: () => set(() => ({ ...initialState })),
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
  setModal: m => set(() => ({ modalComponent: m, backdrop: true })),
  openLoaderModal: () => set(() => ({ modalComponent: Loader({}), backdrop: true })),
  closeModal: () => set(() => ({ modalComponent: null, backdrop: false })),
}));
