import React, { FC } from 'react';
import { animated, useSpring } from 'react-spring';

import { useVhToPixel } from '../../../lib/hooks/useVhToPixel';
import { useFinancialsStore } from '../stores/useFinancialsStore';

import { AccountList } from './accountList';
import { Infoheader } from './infoheader';
import { TransactionList } from './transactionList';

export const Financials: FC<{
  setActiveAccount: (acc: Financials.Account) => void;
  fetchTransactions: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
}> = props => {
  const [openPane, modalComponent, backdrop] = useFinancialsStore(s => [s.openPane, s.modalComponent, s.backdrop]);
  const openHeight = useVhToPixel(70);
  const rootStyles = useSpring({
    height: openPane ? openHeight : 0,
  });

  return (
    <animated.div style={rootStyles}>
      <div className={'financials__wrapper'}>
        <div>
          <Infoheader />
          <AccountList
            setActiveAccount={props.setActiveAccount}
            fetchAccounts={props.fetchAccounts}
            fetchTransactions={props.fetchTransactions}
          />
        </div>
        <TransactionList fetchTransactions={props.fetchTransactions} />
        {modalComponent && (
          <div className={'modal'}>
            <div>{modalComponent}</div>
          </div>
        )}
        {backdrop && <div className={'financials__backdrop'} />}
      </div>
    </animated.div>
  );
};
