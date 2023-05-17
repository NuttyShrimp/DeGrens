import { SQL } from '@dgx/server';

const storedTransactionCache = new Map<string, string[]>();

export const loadCache = async () => {
  const results = await SQL.query<{ transaction_id: string; origin_account_id: string; target_account_id: string }[]>(`
      SELECT DISTINCT transaction_id, origin_account_id, target_account_id
      FROM transaction_log
      ORDER BY date DESC
    `);
  if (!results) return;
  results.forEach(r => {
    const { transaction_id, origin_account_id, target_account_id } = r;
    const originCache = storedTransactionCache.get(origin_account_id);
    const targetCache = storedTransactionCache.get(target_account_id);
    if (!originCache) {
      storedTransactionCache.set(origin_account_id, [transaction_id]);
    } else {
      originCache.push(transaction_id);
    }
    if (!targetCache) {
      storedTransactionCache.set(target_account_id, [transaction_id]);
    } else {
      targetCache.push(transaction_id);
    }
  });
};

export const getTransactionIdsForAccount = (accountId: string) => {
  return storedTransactionCache.get(accountId) || [];
};
