import React, { FC, useMemo, useState } from 'react';
import { Button } from '@src/components/button';

import Numberformat from '../../../components/numberformat';
import { formatRelativeTime } from '../../../lib/util';

const Transaction: FC<
  React.PropsWithChildren<{ transaction: Financials.Transaction; selected: Financials.Account }>
> = ({ transaction, selected }) => {
  const isNegative = useMemo(() => transaction.type === 'withdraw' || transaction.target_account_id !== selected.account_id, [transaction]);
  return (
    <div className={'transaction'}>
      <div className={'transaction__top'}>
        <div className={'transaction__title'}>
          {selected.account_id === transaction.origin_account_id
            ? `${transaction.target_account_name} / ${transaction.target_account_id}`
            : `${transaction.origin_account_name} / ${transaction.origin_account_id}`}
        </div>
        <div className={'transaction__metadata'}>
          <span>{transaction.transaction_id}</span>
          <span>{transaction.type.toUpperCase()}</span>
          <span>{formatRelativeTime(transaction.date)}</span>
        </div>
      </div>
      <div className={'transaction__body'}>
        <div className={`transaction__amount ${isNegative ? 'negative' : ''}`}>
          <span>
            €<Numberformat.Bank value={(isNegative ? -1 : 1) * transaction.change} />
          </span>
        </div>
        <div className={'transaction__info'}>
          <div className={'transaction__info__persons'}>
            <span>{transaction.triggered_by}</span>
            <i className={'fas fa-long-arrow-alt-right'} />
            <span>{transaction.accepted_by}</span>
          </div>
          <div className={'transaction__info__comment'}>
            <div>Comment:</div>
            <div>{transaction.comment}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TransactionList: FC<
  React.PropsWithChildren<{
    selected: Financials.Account | null;
    transactions: Financials.Transaction[];
    fetchTransactions: () => Promise<void>;
    canLoadMore: boolean;
  }>
> = props => {
  const [loadBtnDisabled, setLoadBtnDisabled] = useState(false);
  const loadMoreTrans = async () => {
    setLoadBtnDisabled(true);
    await props.fetchTransactions();
    setLoadBtnDisabled(false);
  };

  if (!props.selected) {
    return <div className={'transaction__list'}>Kies een account om de transacties te bezichtegen</div>;
  }
  if (!props.selected?.permissions?.transactions) {
    return (
      <div className={'transaction__list'}>
        <div className={'transaction__no_perms'}>
          <i className={'fas fa-frown'} />
          <span>Je hebt geen toegang tot de transactielijst van dit account.</span>
        </div>
      </div>
    );
  }
  return (
    <div className={'transaction__list'}>
      {props.transactions.map(transaction => (
        <Transaction
          key={transaction.transaction_id}
          transaction={transaction}
          selected={props.selected as Financials.Account}
        />
      ))}
      {props.canLoadMore && (
        <Button.Primary disabled={loadBtnDisabled} onClick={loadMoreTrans}>
          Laad meer
        </Button.Primary>
      )}
    </div>
  );
};
