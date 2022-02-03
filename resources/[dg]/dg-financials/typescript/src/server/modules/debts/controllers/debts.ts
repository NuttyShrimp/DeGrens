import { debtLogger } from '../helpers/debts';
import debtManager from '../classes/debtmanager';

global.exports('giveFine', (cid: number, target_account: string, fine: number, reason: string, given_by?: number) => {
	debtManager.addDebt(cid, target_account, fine, reason, given_by);
});

DGCore.Functions.CreateCallback('financials:server:debts:get', (src, cb) => {
	debtLogger.silly(`getDebts | src: ${src}`);
	const Player = DGCore.Functions.GetPlayer(src);
	if (!Player) {
		cb([]);
		return;
	}
	const debts = debtManager.getDebtsByCid(Player.PlayerData.citizenid);
	const returnDebts = {
		debt: debts.filter(debt => debt.type === 'debt'),
		maintenance: debts.filter(debt => debt.type === 'maintenance'),
	};
	debtLogger.silly(`getDebts: ${debts.length}`);
	cb(returnDebts);
});

DGCore.Functions.CreateCallback('financials:server:debts:pay', async (src, cb, debtId: number) => {
	debtLogger.silly(`payDebt: ${debtId} | src: ${src}`);
	const Player = DGCore.Functions.GetPlayer(src);
	if (!Player) {
		debtLogger.warn(`payDebt: Player not found | src: ${src}`);
		cb(false);
		return;
	}
	const isSuccess = await debtManager.payDebt(src, debtId);
	cb(isSuccess);
});
