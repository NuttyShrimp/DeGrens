import { Util } from '@dgx/server';
import { getConfigModule } from 'helpers/config';

import { Account } from '../classes/Account';
import { AccountManager } from '../classes/AccountManager';
import { bankLogger } from '../utils';

import { paycheck } from './actions';

export const awaitAccountsLoaded = () => {
  return Util.awaitCondition(() => AccountManager.getInstance().loaded);
};

export const createAccount = async (cid: number, name: string, accType: AccountType = 'standard') => {
  const accId = await AccountManager.getInstance().createAccount(cid, name, accType);
  global.exports['dg-logs'].createGraylogEntry('financials:accountCreated', {
    accountId: accId,
    accountName: name,
    accountType: accType,
    player: cid,
  });
  bankLogger.debug(`Account ${accId} created for ${cid} with name ${name} and type ${accType}`);
  return accId;
};
export const createDefaultAccount = async (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const cid = Player.PlayerData.citizenid;
  const account = AccountManager.getInstance().getDefaultAccount(cid, true);
  if (!account) {
    const accId = await createAccount(cid, 'Persoonlijk account', 'standard');
    paycheck(accId, cid, (await getConfigModule('accounts')).defaultBalance);
  }
};
export const fetchAccounts = async (cid: number): Promise<Account[]> => {
  return AccountManager.getInstance().getAccounts(cid);
};
export const getDefaultAccount = async (cid: number): Promise<Account> => {
  return AccountManager.getInstance().getDefaultAccount(cid);
};
export const getDefaultAccountId = async (cid: number): Promise<string> => {
  const Account = await getDefaultAccount(cid);
  return Account.getAccountId();
};
export const getAccountBalance = (accountId: string): number => {
  const Account = AccountManager.getInstance().getAccountById(accountId);
  return Account.getBalance();
};
export const getAllAccounts = () =>
  AccountManager.getInstance()
    .getAllAcounts()
    .map(a => a.getContext());

export const setPermissions = (accountId: string, cid: number, permissions: IAccountPermission) => {
  const account = AccountManager.getInstance().getAccountById(accountId);
  if (!account) false;
  account.permsManager.addPermissions(cid, permissions);
  return true;
};

export const removePermissions = (accountId: string, cid: number) => {
  const account = AccountManager.getInstance().getAccountById(accountId);
  if (!account) false;
  account.permsManager.removePermissions(cid);
  return true;
};

export const getPermissions = (accountId: string, cid: number) => {
  const account = AccountManager.getInstance().getAccountById(accountId);
  if (!account) null;
  return account.permsManager.getMemberPermissions(cid);
};
