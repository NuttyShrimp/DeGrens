import React, { FC, MouseEvent } from 'react';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Button, IconButton } from '@mui/material';
import { useMainStore } from '@src/lib/stores/useMainStore';

import Numberformat from '../../../components/numberformat';
import { AccountIcon } from '../enum';
import { useFinancialsStore } from '../stores/useFinancialsStore';

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
  const [setModal] = useFinancialsStore(s => [s.setModal]);
  const plyCid = useMainStore(s => s.character.cid);

  const btnClick = (e: MouseEvent, component: React.ReactElement) => {
    e.stopPropagation();
    setModal(component);
  };

  // We can easily check if player is owner knowing that the owner of a savingsaccount wont be included in the members array
  const isSavingsAccountOwner = () => {
    if (!props.account.members) return false;
    return props.account.members.every(m => m.cid !== plyCid);
  };

  return (
    <div
      className={`account bordered-div ${props.selected ? 'selected' : ''}`}
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
          {props.selected && props.account.type === 'savings' && isSavingsAccountOwner() && (
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
    setActiveAccount: (acc: Financials.Account) => void;
    fetchAccounts: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
  }>
> = props => {
  const [accounts, selected] = useFinancialsStore(s => [s.accounts, s.selected]);
  return (
    <div className={'account__list'}>
      {accounts.map(account => (
        <Account
          key={account.account_id}
          account={account}
          setActiveAccount={props.setActiveAccount}
          selected={account.account_id === selected?.account_id}
          fetchAccounts={props.fetchAccounts}
          fetchTransactions={props.fetchTransactions}
        />
      ))}
    </div>
  );
};
