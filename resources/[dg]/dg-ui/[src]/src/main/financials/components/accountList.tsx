import React, { FC, MouseEvent } from 'react';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Button, IconButton } from '@mui/material';

import Numberformat from '../../../components/numberformat';
import { AccountIcon } from '../enum';
import { setModal } from '../lib';

import { DepositModal } from './modals/DepositModal';
import { PermissionsModal } from './modals/PermissionsModal';
import { TransferModal } from './modals/TransferModal';
import { WithdrawModal } from './modals/WithdrawModal';

const Account: FC<
  React.PropsWithChildren<{
    account: Financials.Account;
    setActiveAccount: (acc: Financials.Account) => void;
    selected: boolean;
    fetchAccounts: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
  }>
> = props => {
  const btnClick = (e: MouseEvent, component: React.ReactElement) => {
    e.stopPropagation();
    setModal(component);
  };

  return (
    <div
      className={`account ${props.selected ? 'selected' : ''}`}
      onClick={() => props.setActiveAccount(props.account)}
    >
      <div className='account__body'>
        <div>
          <div className={'account__icon'}>
            <i className={`fas fa-${AccountIcon[props.account.type ?? 'standard']}`} />
          </div>
          <div className={'account__info'}>
            <div id={'name'}>{props.account.name}</div>
            <div id={'id'}>{props.account.account_id}</div>
            <div id={'balance'}>
              €<Numberformat.Bank value={props.account.balance} />
            </div>
          </div>
        </div>
        <div>
          {props.selected && props.account.type === 'savings' && (
            <IconButton
              onClick={e =>
                btnClick(
                  e,
                  <PermissionsModal
                    account={props.account}
                    fetchAccounts={props.fetchAccounts}
                    fetchTransactions={props.fetchTransactions}
                  />
                )
              }
            >
              <ManageAccountsIcon fontSize='large' />
            </IconButton>
          )}
        </div>
      </div>
      {props.selected && (
        <div className={'account__btns'}>
          <Button
            color={'inherit'}
            onClick={e =>
              btnClick(
                e,
                <DepositModal
                  account={props.account}
                  fetchAccounts={props.fetchAccounts}
                  fetchTransactions={props.fetchTransactions}
                />
              )
            }
            disabled={!props.account.permissions.deposit}
          >
            Deposit
          </Button>
          <Button
            color={'inherit'}
            onClick={e =>
              btnClick(
                e,
                <TransferModal
                  account={props.account}
                  fetchAccounts={props.fetchAccounts}
                  fetchTransactions={props.fetchTransactions}
                />
              )
            }
            disabled={!props.account.permissions.transfer}
          >
            Transfer
          </Button>
          <Button
            color={'inherit'}
            onClick={e =>
              btnClick(
                e,
                <WithdrawModal
                  account={props.account}
                  fetchAccounts={props.fetchAccounts}
                  fetchTransactions={props.fetchTransactions}
                />
              )
            }
            disabled={!props.account.permissions.withdraw}
          >
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
    fetchAccounts: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
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
          fetchAccounts={props.fetchAccounts}
          fetchTransactions={props.fetchTransactions}
        />
      ))}
    </div>
  );
};
