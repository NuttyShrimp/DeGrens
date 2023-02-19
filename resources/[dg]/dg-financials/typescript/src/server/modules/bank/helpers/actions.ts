import { Notifications } from '@dgx/server';
import accountManager from '../classes/AccountManager';
import { bankLogger } from '../utils';

export const deposit = async (
  accountId: string,
  triggerCid: number,
  amount: number,
  comment?: string
): Promise<boolean> => {
  const account = accountManager.getAccountById(accountId);
  if (!account) {
    const plyId = DGCore.Functions.getPlyIdForCid(triggerCid);
    if (plyId) {
      Notifications.add(plyId, `Geen account gevonden voor ${accountId}`, 'error');
    }
    bankLogger.error(`Account ${accountId} not found | src: ${plyId} | cid: ${triggerCid}`);
    return false;
  }
  return account.deposit(triggerCid, amount, comment);
};

export const withdraw = async (
  accountId: string,
  triggerCid: number,
  amount: number,
  comment?: string
): Promise<boolean> => {
  const account = accountManager.getAccountById(accountId);
  if (!account) {
    const plyId = DGCore.Functions.getPlyIdForCid(triggerCid);
    if (plyId) {
      Notifications.add(plyId, `Geen account gevonden voor ${accountId}`, 'error');
    }
    bankLogger.error(`Account ${accountId} not found | src: ${plyId} | cid: ${triggerCid}`);
    return false;
  }
  return account.withdraw(triggerCid, amount, comment);
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
  const account = accountManager.getAccountById(accountId);
  if (!account) {
    const plyId = DGCore.Functions.getPlyIdForCid(triggerCid);
    if (plyId) {
      Notifications.add(plyId, `Geen account gevonden voor ${accountId}`, 'error');
    }
    bankLogger.error(`Account ${accountId} not found | src: ${plyId} | cid: ${triggerCid}`);
    return false;
  }
  return account.transfer(targetAccountId, triggerCid, acceptorCid, amount, comment, undefined, taxId);
};

export const purchase = async (
  accountId: string,
  triggerCid: number,
  amount: number,
  comment?: string,
  taxId?: number
): Promise<boolean> => {
  const account = accountManager.getAccountById(accountId);
  if (!account) {
    const plyId = DGCore.Functions.getPlyIdForCid(triggerCid);
    if (plyId) {
      Notifications.add(plyId, `Geen account gevonden voor ${accountId}`, 'error');
    }
    bankLogger.error(`Account ${accountId} not found | src: ${plyId} | cid: ${triggerCid}`);
    return false;
  }
  return account.purchase(triggerCid, amount, comment, taxId);
};

export const paycheck = async (accountId: string, triggerCid: number, amount: number): Promise<boolean> => {
  const account = accountManager.getAccountById(accountId);
  if (!account) {
    const plyId = DGCore.Functions.getPlyIdForCid(triggerCid);
    if (plyId) {
      Notifications.add(plyId, `Geen account gevonden voor ${accountId}`, 'error');
    }
    bankLogger.error(`Account ${accountId} not found | src: ${plyId} | cid: ${triggerCid}`);
    return false;
  }
  const succ = await account.paycheck(triggerCid, amount);
  return succ !== 0;
};

export const mobile_transaction = async (
  accountId: string,
  triggerCid: number,
  targetPhone: string,
  amount: number,
  comment?: string
): Promise<boolean> => {
  const account = accountManager.getAccountById(accountId);
  if (!account) {
    const plyId = DGCore.Functions.getPlyIdForCid(triggerCid);
    if (plyId) {
      Notifications.add(plyId, `Geen account gevonden voor ${accountId}`, 'error');
    }
    bankLogger.error(`Account ${accountId} not found | src: ${plyId} | cid: ${triggerCid}`);
    return false;
  }
  return account.mobileTransfer(targetPhone, triggerCid, amount, comment);
};
