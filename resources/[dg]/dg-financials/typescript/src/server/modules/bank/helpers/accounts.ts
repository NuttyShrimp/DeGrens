import { Util } from '@dgx/server';
import { AccountPermissionValue } from 'sv_constant';
import accountManager from '../classes/AccountManager';
import { bankLogger } from '../utils';

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

export const buildPermissions = (accessLevel: number): IAccountPermission => {
  const permissions: IAccountPermission = {
    deposit: false,
    withdraw: false,
    transfer: false,
    transactions: false,
  };
  try {
    Object.keys(AccountPermissionValue).forEach(key => {
      if (accessLevel & AccountPermissionValue[key as keyof IAccountPermission]) {
        permissions[key as keyof IAccountPermission] = true;
      }
    });
  } catch (e) {
    bankLogger.error(`Error building permissions for level ${accessLevel}`, e);
  } finally {
    return permissions;
  }
};
