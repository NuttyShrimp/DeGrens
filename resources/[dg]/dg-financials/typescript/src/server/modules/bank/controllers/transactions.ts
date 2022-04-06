import { AccountManager } from '../classes/AccountManager';
import { bankLogger } from '../utils';

// region Transactions
const fetchTransactions = async (
  source: number | string,
  accountId: string,
  offset = 0,
  type?: TransactionType
): Promise<ITransaction[]> => {
  const AManager = AccountManager.getInstance();
  const account = AManager.getAccountById(accountId);
  if (!account) {
    return [];
  }
  return account.getTransactions(source, offset, type);
};

DGCore.Functions.CreateCallback(
  'financials:server:transactions:get',
  async (src, cb, data: { accountId: string; loaded: number; type?: TransactionType }) => {
    bankLogger.silly(
      `Fetching transactions: src: ${src} | account ${data.accountId} | offset ${data.loaded} | type: ${
        data.type ?? 'all'
      }`
    );
    const transactions = await fetchTransactions(src, data.accountId, data.loaded, data.type);
    bankLogger.silly(`Transactions fetched: ${transactions.length}`);
    cb(transactions);
  }
);
// endregion
