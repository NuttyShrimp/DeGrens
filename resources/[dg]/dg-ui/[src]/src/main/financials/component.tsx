import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { devData } from '../../lib/devdata';
import { nuiAction } from '../../lib/nui-comms';

import { Financials } from './components/financials';
import { openLoadModal } from './lib';
import store from './store';

import './styles/financials.scss';

const Component: AppFunction<Financials.State> = props => {
  const handleShow = useCallback((data: Financials.BaseInfo) => {
    props.updateState({
      visible: true,
      openPane: true,
      ...data,
    });
  }, []);

  const handleHide = useCallback(() => {
    props.updateState({
      openPane: false,
      // Clear these otherwise we got a strange effect with those list not closing
      accounts: [],
      transactions: [],
    });
    setTimeout(() => {
      props.updateState(store.initialState);
    }, 500);
  }, []);

  const handleEscape = useCallback(() => {
    if (props.modalComponent) {
      props.updateState({
        modalComponent: null,
        backdrop: false,
      });
      return false;
    }
    return true;
  }, [props.modalComponent]);

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

    // filter out double ids if they somehow slipped through (just added for browser dev env tho)
    const registeredTransactionIds = new Set<string>();
    const newTransactions = (reset ? list : [...props.transactions, ...list]).filter(t => {
      if (registeredTransactionIds.has(t.transaction_id)) return false;
      registeredTransactionIds.add(t.transaction_id);
      return true;
    });

    props.updateState({
      canLoadMore: list.length > 0,
      transactions: newTransactions,
      backdrop: false,
      modalComponent: null,
    });
  };

  const setActiveAccount = (acc: Financials.Account) => {
    if (props.selected?.account_id === acc.account_id) return;
    props.updateState({
      selected: acc,
    });
    fetchTransactions(acc.account_id, true);
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
