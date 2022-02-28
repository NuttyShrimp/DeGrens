import { AccountManager } from '../classes/AccountManager';
import { bankLogger } from '../utils';
import { getTaxedPrice } from '../../taxes/service';

const AManager = AccountManager.getInstance();

export const deposit = async (accountId: string, triggerCid: number, amount: number, comment?: string) => {
	const account = await AManager.getAccountById(accountId);
	if (!account) {
		const Player = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		emitNet('DGCore:Notify', Player.PlayerData.source, `Geen account gevonden voor ${accountId}`, 'error');
		bankLogger.error(`Account ${accountId} not found | src: ${Player.PlayerData.source} | cid: ${triggerCid}`);
	}
	await account.deposit(triggerCid, amount, comment);
};

export const withdraw = async (accountId: string, triggerCid: number, amount: number, comment?: string) => {
	const account = await AManager.getAccountById(accountId);
	if (!account) {
		const Player = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		emitNet('DGCore:Notify', Player.PlayerData.source, `Geen account gevonden voor ${accountId}`, 'error');
		bankLogger.error(`Account ${accountId} not found | src: ${Player.PlayerData.source} | cid: ${triggerCid}`);
	}
	await account.withdraw(triggerCid, amount, comment);
};

export const transfer = async (
	accountId: string,
	targetAccountId: string,
	triggerCid: number,
	acceptorCid: number,
	amount: number,
	comment?: string,
	taxId?: number
): Promise<boolean> => {
	const account = await AManager.getAccountById(accountId);
	if (!account) {
		const Player = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		emitNet('DGCore:Notify', Player.PlayerData.source, `Geen account gevonden voor ${accountId}`, 'error');
		bankLogger.error(`Account ${accountId} not found | src: ${Player.PlayerData.source} | cid: ${triggerCid}`);
		return false;
	}
	if (taxId) {
		const { taxPrice } = getTaxedPrice(amount, taxId);
		amount = taxPrice;
	}
	return account.transfer(targetAccountId, triggerCid, acceptorCid, amount, comment);
};

export const purchase = async (
	accountId: string,
	triggerCid: number,
	amount: number,
	comment?: string,
	taxId?: number
): Promise<boolean> => {
	const account = await AManager.getAccountById(accountId);
	if (!account) {
		const Player = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		emitNet('DGCore:Notify', Player.PlayerData.source, `Geen account gevonden voor ${accountId}`, 'error');
		bankLogger.error(`Account ${accountId} not found | src: ${Player.PlayerData.source} | cid: ${triggerCid}`);
		return false;
	}
	const { taxPrice } = getTaxedPrice(amount, taxId);
	return account.purchase(triggerCid, taxPrice, comment);
};

export const paycheck = async (accountId: string, triggerCid: number, amount: number) => {
	const account = await AManager.getAccountById(accountId);
	if (!account) {
		const Player = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		emitNet('DGCore:Notify', Player.PlayerData.source, `Kon paycheck niet uitbetalen`, 'error');
		bankLogger.error(`Account ${accountId} not found | src: ${Player.PlayerData.source} | cid: ${triggerCid}`);
		return false;
	}
	const { taxPrice } = getTaxedPrice(amount, 4, true);
	await account.paycheck(triggerCid, taxPrice);
};

export const mobile_transaction = async (
	accountId: string,
	triggerCid: number,
	targetPhone: string,
	amount: number,
	comment?: string,
): Promise<boolean> => {
	const account = await AManager.getAccountById(accountId);
	if (!account) {
		const Player = DGCore.Functions.GetPlayerByCitizenId(triggerCid);
		emitNet('DGCore:Notify', Player.PlayerData.source, `Geen account gevonden voor ${accountId}`, 'error');
		bankLogger.error(`Account ${accountId} not found | src: ${Player.PlayerData.source} | cid: ${triggerCid}`);
		return false;
	}
	return account.mobileTransfer(targetPhone, triggerCid, amount, comment);
};
