import { RPC } from '@dgx/server';
import accountManager from '../classes/AccountManager';
import { bankLogger } from '../utils';

const fetchTransactions = async (
  source: number,
  accountId: string,
  offset = 0,
  type?: TransactionType
): Promise<DB.ITransaction[]> => {
  const account = accountManager.getAccountById(accountId);
  if (!account) return [];
  return account.getTransactions(source, offset, type);
};

RPC.register(
  'financials:server:transactions:get',
  async (src, data: { accountId: string; loaded?: number; type?: TransactionType }) => {
    bankLogger.silly(
      `Fetching transactions: src: ${src} | account ${data.accountId} | offset ${data.loaded ?? 'none'} | type: ${
        data.type ?? 'all'
      }`
    );
    const transactions = await fetchTransactions(src, data.accountId, data.loaded, data.type);
    bankLogger.silly(`Transactions fetched: ${transactions.length}`);
    return transactions;
  }
);
