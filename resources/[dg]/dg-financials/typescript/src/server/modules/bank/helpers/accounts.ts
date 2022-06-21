import { getConfigModule } from 'helpers/config';
import { Account } from '../classes/Account';
import { AccountManager } from '../classes/AccountManager';
import { bankLogger } from '../utils';

import { paycheck } from './actions';

const AManager = AccountManager.getInstance(); // When lua this would return the class without functions and all properties would be public
export const createAccount = async (cid: number, name: string, accType: AccountType = 'standard') => {
  const accId = await AManager.createAccount(cid, name, accType);
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
  const account = await AManager.getDefaultAccount(cid, true);
  if (!account) {
    const accId = await createAccount(cid, 'Persoonlijk account', 'standard');
    paycheck(accId, cid, (await getConfigModule("accounts")).defaultBalance);
  }
};
export const fetchAccounts = async (cid: number): Promise<Account[]> => {
  return AManager.getAccounts(cid);
};
export const getDefaultAccount = async (cid: number): Promise<Account> => {
  return AManager.getDefaultAccount(cid);
};
export const getDefaultAccountId = async (cid: number): Promise<string> => {
  const Account = await getDefaultAccount(cid);
  return Account.getAccountId();
};
export const getAccountBalance = (accountId: string): number => {
  const Account = AManager.getAccountById(accountId);
  return Account.getBalance();
};
