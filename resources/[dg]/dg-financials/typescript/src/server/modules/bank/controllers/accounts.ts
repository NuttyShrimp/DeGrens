import { Player as IPlayer } from '@ts-shared/server/types/core';

import { getCash } from '../../cash/service';
import {
  createAccount,
  createDefaultAccount,
  fetchAccounts,
  getAccountBalance,
  getDefaultAccount,
  getDefaultAccountId,
} from '../helpers/accounts';
import { bankLogger } from '../utils';

global.exports('createAccount', createAccount);
global.exports('getDefaultAccount', getDefaultAccount);
global.exports('getDefaultAccountId', getDefaultAccountId);
global.exports('getAccountBalance', getAccountBalance);

export const checkPlayerAccounts = () => {
  DGCore.Functions.GetPlayers().forEach(ply => createDefaultAccount(ply));
};

// region Events
on('financials:server:account:create', createAccount);
on('DGCore:Server:PlayerLoaded', async (ply: IPlayer) => {
  createDefaultAccount(ply.PlayerData.source);
});
// endregion
// region Callbacks
DGCore.Functions.CreateCallback('financials:server:account:get', async (src, cb) => {
  bankLogger.silly('Callback: getAccounts');
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    bankLogger.debug(`Player ${src} not found`);
    cb([]);
    return;
  }
  const accounts = await fetchAccounts(Player.PlayerData.citizenid);
  const cAccounts = accounts.map(account => {
    return account.getClientVersion(Player.PlayerData.citizenid);
  });
  bankLogger.silly(`Callback: getAccounts: ${JSON.stringify(cAccounts)}`);
  cb(cAccounts);
});

DGCore.Functions.CreateCallback('financials:accounts:open', (src, cb, name: string) => {
  bankLogger.silly('Callback: openAccount');
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    bankLogger.debug(`Player ${src} not found`);
    cb({});
    return;
  }
  const info: BaseState = {
    bank: name.replace(/_.*/, '').replace(/^./, str => str.toUpperCase()),
    cash: getCash(src),
  };
  bankLogger.silly(`Callback: openAccount: ${JSON.stringify(info)}`);
  cb(info);
});

DGCore.Functions.CreateCallback('financials:getDefaultAccount', async (src, cb) => {
  bankLogger.silly('Callback: getDefaultAccount');
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    bankLogger.debug(`Player ${src} not found`);
    cb(undefined);
    return;
  }
  const account = await getDefaultAccount(Player.PlayerData.citizenid);
  const cAccount = account.getClientVersion(Player.PlayerData.citizenid);
  bankLogger.silly(`Callback: getDefaultAccount: Returning account for ${src} with id ${account.getAccountId()}`);
  cb(cAccount);
});
// endregion
