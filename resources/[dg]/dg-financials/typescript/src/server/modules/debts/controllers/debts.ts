import { RPC } from '@dgx/server';
import dayjs from 'dayjs';
import accountManager from 'modules/bank/classes/AccountManager';

import debtManager from '../classes/debtmanager';
import { debtLogger, getDaysUntilDue } from '../helpers/debts';
import { removeMaintenanceFees } from '../helpers/maintenanceFees';

global.exports(
  'giveFine',
  (cid: number, target_account: string, fine: number, reason: string, origin_name: string, given_by?: number) => {
    debtManager.addDebt(cid, target_account, fine, reason, origin_name, given_by);
  }
);
global.exports('removeMaintenanceFees', (src: number) => removeMaintenanceFees(src));

RPC.register('financials:server:debts:get', src => {
  debtLogger.silly(`getDebts | src: ${src}`);
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    return [];
  }
  const debts = debtManager.getDebtsByCid(Player.PlayerData.citizenid);
  debtLogger.silly(`getDebts: ${debts.length}`);
  return debts.map(d => {
    const date = dayjs.unix(d.date).add(getDaysUntilDue(d.debt), 'day').unix();
    const accountName = accountManager.getAccountById(d.target_account)?.getName();
    return {
      ...d,
      target_account: accountName ?? '',
      date,
    };
  });
});

RPC.register('financials:server:debts:pay', async (src, debtId: number, percentage = 100) => {
  debtLogger.silly(`payDebt: ${debtId} | perc: ${percentage}% | src: ${src}`);
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    debtLogger.warn(`payDebt: Player not found | src: ${src}`);
    return false;
  }
  return debtManager.payDebt(src, debtId, percentage);
});
