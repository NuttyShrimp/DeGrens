import React, { FC, useEffect } from 'react';
import { animated, useSpring } from 'react-spring';

import { useVhToPixel } from '../../../lib/hooks/useVhToPixel';

import { AccountList } from './accountList';
import { Infoheader } from './infoheader';
import { TransactionList } from './transactionList';

export const Financials: FC<
  Financials.Props & {
    setActiveAccount: (acc: Financials.Account) => void;
    fetchTransactions: () => Promise<void>;
    fetchAccounts: () => Promise<void>;
  }
> = props => {
  const openHeight = useVhToPixel(70);
  const rootStyles = useSpring({
    height: props.openPane ? openHeight : 0,
  });

  useEffect(() => {
    if (!props.visible) return;
    setTimeout(() => {
      props.fetchAccounts();
    }, 500);
  }, [props.visible]);

  return (
    <animated.div style={rootStyles}>
      <div className={'financials__wrapper'}>
        <div>
          <Infoheader bank={props.bank} cash={props.cash} />
          <AccountList accounts={props.accounts} selected={props.selected} setActiveAccount={props.setActiveAccount} />
        </div>
        <TransactionList
          transactions={props.transactions}
          fetchTransactions={props.fetchTransactions}
          selected={props.selected}
          canLoadMore={props.canLoadMore}
        />
        {props.modalComponent && (
          <div className={'modal'}>
            <div>
              {props.modalComponent({
                selected: props.selected as Financials.Account,
                fetchAccounts: props.fetchAccounts,
                fetchTransactions: props.fetchTransactions,
              })}
            </div>
          </div>
        )}
        {props.backdrop && <div className={'financials__backdrop'} />}
      </div>
    </animated.div>
  );
};
