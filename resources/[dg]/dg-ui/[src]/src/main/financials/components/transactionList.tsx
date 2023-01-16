import React, { FC, useMemo, useState } from 'react';
import { Button } from '@src/components/button';

import Numberformat from '../../../components/numberformat';
import { formatRelativeTime } from '../../../lib/util';
import { useFinancialsStore } from '../stores/useFinancialsStore';

const Transaction: FC<
  React.PropsWithChildren<{ transaction: Financials.Transaction; selected: Financials.Account }>
> = ({ transaction, selected }) => {
  // We use isTarget and not isOrigin because target is higher prio
  // For example with deposit, origin and target are same but its an increase so it should not be negative
  const isTarget = useMemo(() => {
    return selected.account_id === transaction.target_account_id;
  }, [selected.account_id, transaction.target_account_id]);

  const isNegative = useMemo(() => {
    return transaction.type === 'withdraw' || !isTarget;
  }, [transaction.type, isTarget]);

  return (
    <div className={'transaction'}>
      <div className={'transaction__top'}>
        <div className={'transaction__title'}>
          {isTarget
            ? `${transaction.origin_account_name} / ${transaction.origin_account_id}`
            : `${transaction.target_account_name} / ${transaction.target_account_id}`}
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
            €
            <Numberformat.Bank
              value={(isNegative ? -1 : 1) * (isTarget ? transaction.target_change : transaction.origin_change)}
            />
          </span>
        </div>
        <div className={'transaction__info'}>
          <div className={'transaction__info__persons'}>
            <span>{transaction.triggered_by}</span>
            {transaction.accepted_by != null && (
              <>
                <i className={'fas fa-long-arrow-alt-right'} />
                <span>{transaction.accepted_by}</span>
              </>
            )}
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
    fetchTransactions: () => Promise<void>;
  }>
> = props => {
  const [selected, transactions, canLoadMore] = useFinancialsStore(s => [s.selected, s.transactions, s.canLoadMore]);
  const [loadBtnDisabled, setLoadBtnDisabled] = useState(false);
  const loadMoreTrans = async () => {
    setLoadBtnDisabled(true);
    await props.fetchTransactions();
    setLoadBtnDisabled(false);
  };

  if (!selected) {
    return <div className={'transaction__list'}>Kies een account om de transacties te bezichtegen</div>;
  }
  if (!selected?.permissions?.transactions) {
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
      {transactions.map(transaction => (
        <Transaction
          key={transaction.transaction_id}
          transaction={transaction}
          selected={selected as Financials.Account}
        />
      ))}
      {canLoadMore && (
        <Button.Primary disabled={loadBtnDisabled} onClick={loadMoreTrans}>
          Laad meer
        </Button.Primary>
      )}
    </div>
  );
};
