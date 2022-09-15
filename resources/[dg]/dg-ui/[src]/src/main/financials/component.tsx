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

  const handleEscape = () => {
    if (props.modalComponent) {
      props.updateState({
        modalComponent: null,
        backdrop: false,
      })
      return false
    }
    return handleHide();
  }

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

  const fetchTransactions = async (accountId?: string, reset?: boolean) => {
    if (!accountId) {
      accountId = props.selected?.account_id;
    }
    if (!accountId) return;
    openLoadModal();
    const list = await nuiAction<Financials.Transaction[]>(
      'financials/transactions/get',
      {
        accountId: accountId,
        loaded: reset ? 0 : props.transactions.length,
      },
      devData.financialsTransactions
    );
    props.updateState({
      canLoadMore: list.length > 0,
      transactions: reset ? list : [...props.transactions, ...list],
      backdrop: false,
      modalComponent: null,
    });
  };

  const setActiveAccount = (acc: Financials.Account) => {
    if (props.selected?.account_id === acc.account_id) return;
    props.updateState({
      selected: acc,
      transactions: [],
    });
    fetchTransactions(acc.account_id);
  };

  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} onEscape={handleEscape} center full>
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
