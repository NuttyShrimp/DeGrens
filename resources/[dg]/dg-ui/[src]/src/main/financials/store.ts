import { StoreObject } from '@lib/redux';

const store: StoreObject<Financials.State> = {
  key: 'financials',
  initialState: {
    visible: false,
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
  },
};
export default store;
