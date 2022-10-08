import { Util } from '@dgx/server';
import accountManager from '../classes/AccountManager';

export const createDefaultAccount = async (src: number) => {
  const cid = Util.getCID(src);
  const existingAccount = accountManager.getDefaultAccount(cid, true);
  if (!existingAccount) {
    const newAccount = await accountManager.createAccount(cid, 'Persoonlijk Account', 'standard');
    newAccount.setDefaultBalance(cid);
  }
};

export const setPermissions = (accountId: string, cid: number, permissions: IAccountPermission) => {
  const account = accountManager.getAccountById(accountId);
  if (!account) return false;
  account.permsManager.addPermissions(cid, permissions);
  return true;
};

export const removePermissions = (accountId: string, cid: number) => {
  const account = accountManager.getAccountById(accountId);
  if (!account) return false;
  account.permsManager.removePermissions(cid);
  return true;
};

export const getPermissions = (accountId: string, cid: number) => {
  const account = accountManager.getAccountById(accountId);
  if (!account) return null;
  return account.permsManager.getMemberPermissions(cid);
};
