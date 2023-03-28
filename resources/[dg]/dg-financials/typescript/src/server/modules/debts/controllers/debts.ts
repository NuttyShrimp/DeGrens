import { RPC } from '@dgx/server';
import dayjs from 'dayjs';
import accountManager from 'modules/bank/classes/AccountManager';

import debtManager from '../classes/debtmanager';
import { debtLogger, getDaysUntilDue } from '../helpers/debts';
import { removeMaintenanceFees, scheduleMaintenanceFees } from '../helpers/maintenanceFees';

global.exports(
  'giveFine',
  (
    cid: number,
    target_account: string,
    fine: number,
    reason: string,
    origin_name: string,
    given_by?: number,
    cbEvt?: string,
    payTerm?: number
  ) => {
    debtManager.addDebt(cid, target_account, fine, reason, origin_name, given_by, cbEvt, payTerm);
  }
);
global.exports(
  'addMaintentenanceFee',
  (cid: number, target_account: string, fine: number, reason: string, origin_name: string) => {
    debtManager.addDebt(cid, target_account, fine, reason, origin_name, undefined, undefined, undefined, 'maintenance');
  }
);
global.exports('removeMaintenanceFees', (src: number) => removeMaintenanceFees(src));
global.asyncExports('removeDebt', async (debtId: number | number[]) => {
  if (!Array.isArray(debtId)) {
    debtId = [debtId];
  }
  await debtManager.removeDebts(debtId);
});

RPC.register('financials:server:debts:get', async src => {
  debtLogger.silly(`getDebts | src: ${src}`);
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    return [];
  }
  const debts = await debtManager.getDebtsByCid(Player.PlayerData.citizenid);
  debtLogger.silly(`getDebts: ${debts.length}`);
  return debts.map(d => {
    const date = dayjs
      .unix(d.date)
      .add(d.pay_term ?? getDaysUntilDue(d.debt), 'day')
      .unix();
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

RegisterCommand(
  'financials:scheduleMFees',
  () => {
    scheduleMaintenanceFees();
  },
  true
);