import React, { FC, MouseEvent } from 'react';
import { Button } from '@mui/material';

import Numberformat from '../../../components/numberformat';
import { AccountIcon } from '../enum';
import { setModal } from '../lib';

import { DepositModal } from './modals/DepositModal';
import { TransferModal } from './modals/TransferModal';
import { WithdrawModal } from './modals/WithdrawModal';

const Account: FC<
  React.PropsWithChildren<{
    account: Financials.Account;
    setActiveAccount: (acc: Financials.Account) => void;
    selected: boolean;
  }>
> = ({ account, setActiveAccount, selected }) => {
  const btnClick = (e: MouseEvent, component: React.FC<React.PropsWithChildren<any>>) => {
    e.stopPropagation();
    setModal(component);
  };

  return (
    <div className={`account ${selected ? 'selected' : ''}`} onClick={() => setActiveAccount(account)}>
      <div>
        <div className={'account__icon'}>
          <i className={`fas fa-${AccountIcon[account.type ?? 'standard']}`} />
        </div>
        <div className={'account__info'}>
          <div id={'name'}>{account.name}</div>
          <div id={'id'}>{account.account_id}</div>
          <div id={'balance'}>
            €<Numberformat.Bank value={account.balance} />
          </div>
        </div>
      </div>
      {selected && (
        <div className={'account__btns'}>
          <Button color={'inherit'} onClick={e => btnClick(e, DepositModal)}>
            Deposit
          </Button>
          <Button color={'inherit'} onClick={e => btnClick(e, TransferModal)}>
            Transfer
          </Button>
          <Button color={'inherit'} onClick={e => btnClick(e, WithdrawModal)}>
            Withdraw
          </Button>
        </div>
      )}
    </div>
  );
};

export const AccountList: FC<
  React.PropsWithChildren<{
    accounts: Financials.Account[];
    selected: Financials.Account | null;
    setActiveAccount: (acc: Financials.Account) => void;
  }>
> = props => {
  return (
    <div className={'account__list'}>
      {props.accounts.map(account => (
        <Account
          key={account.account_id}
          account={account}
          setActiveAccount={props.setActiveAccount}
          selected={account.account_id === props?.selected?.account_id}
        />
      ))}
    </div>
  );
};
