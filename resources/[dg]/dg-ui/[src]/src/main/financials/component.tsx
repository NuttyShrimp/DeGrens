import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { devData } from '../../lib/devdata';
import { nuiAction } from '../../lib/nui-comms';

import { Financials } from './components/financials';
import { useFinancialsStore } from './stores/useFinancialsStore';
import config from './_config';

import './styles/financials.scss';
import { flushSync } from 'react-dom';

const Component: AppFunction = props => {
  const [updateStore, resetStore, modalComponent, selected, transactions, openLoadModal] = useFinancialsStore(s => [
    s.updateStore,
    s.resetStore,
    s.modalComponent,
    s.selected,
    s.transactions,
    s.openLoaderModal,
  ]);
  const handleShow = useCallback(
    (data: Financials.BaseInfo) => {
      flushSync(() => props.showApp());
      updateStore({
        openPane: true,
        ...data,
      });
      setTimeout(() => {
        fetchAccounts();
      }, 400);
    },
    [updateStore]
  );

  const handleHide = useCallback(() => {
    updateStore({
      openPane: false,
      // Clear these otherwise we got a strange effect with those list not closing
      accounts: [],
      transactions: [],
    });
    setTimeout(() => {
      props.hideApp();
      resetStore();
    }, 500);
  }, [updateStore]);

  const handleEscape = useCallback(() => {
    if (modalComponent) {
      updateStore({
        modalComponent: null,
        backdrop: false,
      });
      return false;
    }
    return true;
  }, [modalComponent]);

  const fetchAccounts = async () => {
    const newAccounts = await nuiAction<Financials.Account[]>(
      'financials/accounts/get',
      {},
      devData.financialsAccounts
    );
    const cash = await nuiAction<number>('financials/cash/get', {}, 500);
    updateStore({
      accounts: newAccounts,
      transactions: [],
      cash,
    });
  };

  const fetchTransactions = async (accountId?: string, reset?: boolean) => {
    if (!accountId) {
      accountId = selected?.account_id;
    }
    if (!accountId) return;
    openLoadModal();
    const list = await nuiAction<Financials.Transaction[]>(
      'financials/transactions/get',
      {
        accountId: accountId,
        loaded: reset ? 0 : transactions.length,
      },
      devData.financialsTransactions
    );

    // filter out double ids if they somehow slipped through (just added for browser dev env tho)
    const registeredTransactionIds = new Set<string>();
    const newTransactions = (reset ? list : [...transactions, ...list]).filter(t => {
      if (registeredTransactionIds.has(t.transaction_id)) return false;
      registeredTransactionIds.add(t.transaction_id);
      return true;
    });

    updateStore({
      canLoadMore: list.length > 0,
      transactions: newTransactions,
      backdrop: false,
      modalComponent: null,
    });
  };

  const setActiveAccount = (acc: Financials.Account) => {
    if (selected?.account_id === acc.account_id) return;
    updateStore({
      selected: acc,
    });
    fetchTransactions(acc.account_id, true);
  };

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} onEscape={handleEscape} center full>
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
