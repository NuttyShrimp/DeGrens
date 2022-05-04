import { RPC } from '@dgx/server';
import debtManager from '../classes/debtmanager';
import { debtLogger } from '../helpers/debts';

global.exports('giveFine', (cid: number, target_account: string, fine: number, reason: string, given_by?: number) => {
  debtManager.addDebt(cid, target_account, fine, reason, given_by);
});

RPC.register('financials:server:debts:get', src => {
  debtLogger.silly(`getDebts | src: ${src}`);
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    return [];
  }
  const debts = debtManager.getDebtsByCid(Player.PlayerData.citizenid);
  const returnDebts = {
    debt: debts.filter(debt => debt.type === 'debt'),
    maintenance: debts.filter(debt => debt.type === 'maintenance'),
  };
  debtLogger.silly(`getDebts: ${debts.length}`);
  return returnDebts;
});

RPC.register('financials:server:debts:pay', async (src, debtId: number) => {
  debtLogger.silly(`payDebt: ${debtId} | src: ${src}`);
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    debtLogger.warn(`payDebt: Player not found | src: ${src}`);
    return false;
  }
  const isSuccess = await debtManager.payDebt(src, debtId);
  return isSuccess;
});
