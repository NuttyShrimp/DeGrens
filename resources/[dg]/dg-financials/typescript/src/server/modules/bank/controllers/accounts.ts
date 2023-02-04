import { Chat, Events, Financials, Notifications, RPC, Util } from '@dgx/server';

import { getCash } from '../../cash/service';
import accountManager from '../classes/AccountManager';
import { createDefaultAccount, getPermissions, removePermissions, setPermissions } from '../helpers/accounts';
import { bankLogger } from '../utils';

global.asyncExports('createAccount', async (cid: number, name: string, accType: AccountType) => {
  const acc = await accountManager.createAccount(cid, name, accType);
  return acc.getAccountId();
});
global.exports('getDefaultAccount', (cid: number) => {
  return accountManager.getDefaultAccount(cid)?.getContext();
});
global.exports('getDefaultAccountId', (cid: number) => {
  return accountManager.getDefaultAccount(cid)?.getAccountId();
});
global.exports('getAccountBalance', (accountId: string) => {
  return accountManager.getAccountById(accountId)?.getBalance();
});
global.exports('getAllAccounts', () => {
  return accountManager.getAllAcounts().map(a => a.getContext());
});
global.exports('setPermissions', (accountId: string, cid: number, permissions: IAccountPermission) =>
  setPermissions(accountId, cid, permissions)
);
global.exports('removePermissions', (accountId: string, cid: number) => removePermissions(accountId, cid));
global.exports('getPermissions', (accountId: string, cid: number) => getPermissions(accountId, cid));

Util.onPlayerLoaded(playerData => {
  createDefaultAccount(playerData.source);
});

// endregion
// region Callbacks
RPC.register('financials:server:account:get', async src => {
  bankLogger.silly('Callback: getAccounts');
  const cid = Util.getCID(src);
  const accounts = accountManager.getAccountsForCid(cid);
  const cAccounts = [];
  for (const acc of accounts) {
    const clientVersion = await acc.getClientVersion(cid);
    cAccounts.push(clientVersion);
  }
  bankLogger.silly(`Callback: getAccounts: ${JSON.stringify(cAccounts)}`);
  return cAccounts;
});

RPC.register('financials:accounts:open', (src, name: string) => {
  bankLogger.silly('Callback: openAccount');
  const info: BaseState = {
    bank: name.replace(/_.*/, '').replace(/^./, str => str.toUpperCase()),
    cash: getCash(src),
  };
  bankLogger.silly(`Callback: openAccount: ${JSON.stringify(info)}`);
  return info;
});

RPC.register('financials:getDefaultAccount', async src => {
  bankLogger.silly('Callback: getDefaultAccount');
  const cid = Util.getCID(src);
  const account = accountManager.getDefaultAccount(cid);
  if (!account) {
    bankLogger.debug(`Player ${cid} Default account not found`);
    return;
  }
  const cAccount = await account.getClientVersion(cid);
  bankLogger.silly(`Callback: getDefaultAccount: Returning account for ${src} with id ${account.getAccountId()}`);
  return cAccount;
});
// endregion

Events.onNet('financials:bank:savings:create', (src: number, accountName: string) => {
  const cid = Util.getCID(src);
  const existingAccount = accountManager.getSavingsAccount(cid);
  if (existingAccount !== undefined) {
    Notifications.add(src, 'Je hebt al een spaarrekening', 'error');
    return;
  }
  accountManager.createAccount(cid, accountName, 'savings');
});
