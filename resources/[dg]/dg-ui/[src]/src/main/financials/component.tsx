import React from 'react';
import AppWrapper from '@components/appwrapper';

import { devData } from '../../lib/devdata';
import { nuiAction } from '../../lib/nui-comms';

import { Financials } from './components/financials';
import { openLoadModal } from './lib';
import store from './store';

import './styles/financials.scss';

const Component: AppFunction<Financials.State> = props => {
  const handleShow = (data: Financials.BaseInfo) => {
    props.updateState({
      visible: true,
      openPane: true,
      ...data,
    });
  };

  const handleHide = () => {
    props.updateState({
      openPane: false,
      // Clear these otherwise we got a strange effect with those list not closing
      accounts: [],
      transactions: [],
    });
    setTimeout(() => {
      props.updateState(store.initialState);
    }, 500);
  };

  const fetchAccounts = async () => {
    const newAccounts = await nuiAction<Financials.Account[]>(
      'financials/accounts/get',
      {},
      devData.financialsAccounts
    );
    const cash = await nuiAction<number>('financials/cash/get', {}, 500);
    props.updateState({
      accounts: newAccounts,
      transactions: [],
      cash,
    });
  };

  const fetchTransactions = async () => {
    if (!props.selected?.account_id) return;
    openLoadModal();
    const list = await nuiAction<Financials.Transaction[]>(
      'financials/transactions/get',
      {
        accountId: props.selected.account_id,
        loaded: props.transactions.length,
      },
      devData.financialsTransactions
    );
    props.updateState({
      canLoadMore: list.length > 0,
      transactions: [...props.transactions, ...list],
      backdrop: false,
      modalComponent: null,
    });
  };

  const setActiveAccount = (acc: Financials.Account) => {
    props.updateState({
      selected: acc,
      transactions: [],
    });
    setTimeout(() => {
      fetchTransactions();
    }, 10);
  };

  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} onEscape={handleHide} center full>
      <Financials
        {...props}
        setActiveAccount={setActiveAccount}
        fetchTransactions={fetchTransactions}
        fetchAccounts={fetchAccounts}
      />
    </AppWrapper>
  );
};

export default Component;
