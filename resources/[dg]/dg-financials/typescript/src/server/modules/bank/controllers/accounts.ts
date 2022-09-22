import { RPC } from '@dgx/server';

import { getCash } from '../../cash/service';
import {
  awaitAccountsLoaded,
  createAccount,
  createDefaultAccount,
  fetchAccounts,
  getAccountBalance,
  getAllAccounts,
  getDefaultAccount,
  getDefaultAccountId,
  getPermissions,
  removePermissions,
  setPermissions,
} from '../helpers/accounts';
import { bankLogger } from '../utils';

global.asyncExports('createAccount', (cid: number, name: string, accType: AccountType = 'standard') =>
  createAccount(cid, name, accType)
);

global.asyncExports('getDefaultAccount', async (cid: number) => (await getDefaultAccount(cid)).getContext());
global.asyncExports('getDefaultAccountId', (cid: number) => getDefaultAccountId(cid));
global.exports('getAccountBalance', (accId: string) => getAccountBalance(accId));
global.exports('getAllAccounts', () => getAllAccounts());
global.exports('setPermissions', (accountId: string, cid: number, permissions: IAccountPermission) =>
  setPermissions(accountId, cid, permissions)
);
global.exports('removePermissions', (accountId: string, cid: number) => removePermissions(accountId, cid));
global.exports('getPermissions', (accountId: string, cid: number) => getPermissions(accountId, cid));
global.exports('awaitAccountsLoaded', () => awaitAccountsLoaded());

export const checkPlayerAccounts = () => {
  DGCore.Functions.GetPlayers().forEach(ply => createDefaultAccount(ply));
};

// region Events
on('financials:server:account:create', (cid: number, name: string, accType?: AccountType) =>
  createAccount(cid, name, accType)
);
on('DGCore:Server:PlayerLoaded', (ply: Player) => {
  createDefaultAccount(ply.PlayerData.source);
});
// endregion
// region Callbacks
RPC.register('financials:server:account:get', async src => {
  bankLogger.silly('Callback: getAccounts');
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    bankLogger.debug(`Player ${src} not found`);
    return [];
  }
  const accounts = await fetchAccounts(Player.PlayerData.citizenid);
  const cAccounts = accounts.map(account => {
    return account.getClientVersion(Player.PlayerData.citizenid);
  });
  bankLogger.silly(`Callback: getAccounts: ${JSON.stringify(cAccounts)}`);
  return cAccounts;
});

RPC.register('financials:accounts:open', (src, name: string) => {
  bankLogger.silly('Callback: openAccount');
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    bankLogger.debug(`Player ${src} not found`);
    return {};
  }
  const info: BaseState = {
    bank: name.replace(/_.*/, '').replace(/^./, str => str.toUpperCase()),
    cash: getCash(src),
  };
  bankLogger.silly(`Callback: openAccount: ${JSON.stringify(info)}`);
  return info;
});

RPC.register('financials:getDefaultAccount', async src => {
  bankLogger.silly('Callback: getDefaultAccount');
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    bankLogger.debug(`Player ${src} not found`);
    return undefined;
  }
  const account = await getDefaultAccount(Player.PlayerData.citizenid);
  const cAccount = account.getClientVersion(Player.PlayerData.citizenid);
  bankLogger.silly(`Callback: getDefaultAccount: Returning account for ${src} with id ${account.getAccountId()}`);
  return cAccount;
});
// endregion
