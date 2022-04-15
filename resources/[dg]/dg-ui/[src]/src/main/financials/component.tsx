import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { devData } from '../../lib/devdata';
import { nuiAction } from '../../lib/nui-comms';

import { Financials } from './components/financials';
import { openLoadModal } from './lib';
import store from './store';

import './styles/financials.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Financials.Props, any> {
  handleShow = (data: Financials.BaseInfo) => {
    this.props.updateState({
      visible: true,
      openPane: true,
      ...data,
    });
  };

  handleHide = () => {
    this.props.updateState({
      openPane: false,
      // Clear these otherwise we got a strange effect with those list not closing
      accounts: [],
      transactions: [],
    });
    setTimeout(() => {
      this.props.updateState(store.initialState);
    }, 500);
  };

  fetchAccounts = async () => {
    const newAccounts = await nuiAction<Financials.Account[]>(
      'financials/accounts/get',
      {},
      devData.financialsAccounts
    );
    const cash = await nuiAction<number>('financials/cash/get', {}, 500);
    this.props.updateState({
      accounts: newAccounts,
      transactions: [],
      cash,
    });
  };

  fetchTransactions = async () => {
    if (!this.props.selected?.account_id) return;
    openLoadModal();
    const list = await nuiAction<Financials.Transaction[]>(
      'financials/transactions/get',
      {
        accountId: this.props.selected.account_id,
        loaded: this.props.transactions.length,
      },
      devData.financialsTransactions
    );
    this.props.updateState({
      canLoadMore: list.length > 0,
      transactions: [...this.props.transactions, ...list],
      backdrop: false,
      modalComponent: null,
    });
  };

  setActiveAccount = (acc: Financials.Account) => {
    this.props.updateState({
      selected: acc,
      transactions: [],
    });
    setTimeout(() => {
      this.fetchTransactions();
    }, 10);
  };

  setModal(component: React.FC) {
    this.props.updateState({
      modalComponent: component,
      backdrop: true,
    });
  }

  render() {
    return (
      <AppWrapper
        appName={store.key}
        onShow={this.handleShow}
        onHide={this.handleHide}
        onEscape={this.handleHide}
        center
        full
      >
        <Financials
          {...this.props}
          setActiveAccount={this.setActiveAccount}
          fetchTransactions={this.fetchTransactions}
          fetchAccounts={this.fetchAccounts}
        />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
