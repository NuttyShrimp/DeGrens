import { SQL } from '@dgx/server';
import { Util } from '@dgx/shared';
import dayjs from 'dayjs';
import { getConfigModule } from 'helpers/config';
import { accountManager } from 'modules/bank/classes/AccountManager';

import { taxLogger } from './util';

const taxes: Map<number, Taxes.Tax> = new Map();
let taxConfig: Config['taxes'] = null;
const seededAccs: string[] = [];
let taxAccTimeout: NodeJS.Timeout;

export const seedTaxes = async () => {
  taxConfig = await getConfigModule('taxes');
  (await getConfigModule('accounts')).toSeed.forEach(acc => seededAccs.push(acc.id));
  const query = `
		SELECT tax_id, tax_name, tax_rate
		FROM taxes
	`;
  const result = await SQL.query(query);
  if (result) {
    result.forEach((row: any) => {
      taxLogger.debug(`Loading tax ${row.tax_name} with rate ${row.tax_rate}`);
      taxes.set(row.tax_id, { category: row.tax_name, rate: row.tax_rate / 100 });
    });
  }
  for (let i = 0; i < taxConfig.cats.length; i++) {
    const tax = taxConfig.cats[i];
    const taxId = i + 1;
    let isTaxRegistered = false;
    taxes.forEach(t => {
      if (t.category === tax.category) {
        isTaxRegistered = true;
      }
    });
    if (isTaxRegistered) continue;
    const query = `
			INSERT INTO taxes (tax_id, tax_name, tax_rate)
			VALUES (?, ?, ?)
		`;
    await SQL.query(query, [taxId, tax.category, tax.rate]);
    taxLogger.silly(`Seeded tax ${tax.category}(${taxId}) with rate ${tax.rate}`);
    taxes.set(taxId, { category: tax.category, rate: tax.rate / 100 });
  }
};

/**
 * Get price with taxes on top
 * @param price
 * @param taxId
 * @param shouldRemove Default false, Takes the taxed part of the base price instead of adding it
 */
export const getTaxedPrice = (price: number, taxId: number, shouldRemove = false): Taxes.TaxedPrice => {
  if (!taxes.has(taxId)) {
    taxLogger.warn(`Tax with id: ${taxId} not found, returning original price`);
    return { taxPrice: price, taxRate: 0 };
  }
  const taxInfo = taxes.get(taxId);
  return {
    taxPrice: price + price * taxInfo.rate * taxConfig.inflation * (shouldRemove ? -1 : 1),
    taxRate: taxInfo.rate,
  };
};

/**
 * @oaram lastLog Last time a acc's where taxed, unix timestamp in seconds
 */
const taxBankAccounts = async (lastLog: number) => {
  await Util.awaitCondition(() => taxConfig !== null);
  const sortedAccounts = accountManager.getAllAcounts().sort((a1, a2) => a1.getBalance() - a2.getBalance());
  const prevLogDate = dayjs.unix(lastLog);
  sortedAccounts.forEach(async (account, i) => {
    const wealthPerc = i / sortedAccounts.length;
    const bracket = taxConfig.brackets.find(b => Number(b.group) / 100 >= wealthPerc);
    await Util.awaitCondition(() => account.permsManager.getMembers().length !== 0);
    const taxAmount = account.getBalance() * (bracket.tax / 100);
    // Do not inactive accounts
    if (dayjs(account.lastOperation).isBefore(prevLogDate)) return;
    if (seededAccs.includes(account.getAccountId())) return;

    const accOwner = account.permsManager.getAccountOwner();
    account.transfer('BE1', accOwner.cid, accOwner.cid, taxAmount, 'Account operation cost', true);
  });
  taxLogger.info('Applied taxes to bank accounts');
  await SQL.query('INSERT INTO tax_logs (date) VALUES (CURRENT_TIME)');
};

export const scheduleBankTaxes = async () => {
  if (taxAccTimeout) {
    clearTimeout(taxAccTimeout);
    taxAccTimeout = null;
  }
  const lastTerm = await SQL.query<{ date: number }[]>(
    'SELECT UNIX_TIMESTAMP(date) AS date FROM tax_logs ORDER BY id desc LIMIT 1'
  );
  if (!lastTerm || lastTerm.length === 0) {
    // Do taxes NOW
    taxBankAccounts(0);
  } else {
    const taxDay = dayjs.unix(lastTerm[0].date).add(12, 'day');
    const hoursTillTax = taxDay.diff(dayjs(), 'hours');
    if (hoursTillTax < 0) {
      taxBankAccounts(lastTerm[0].date);
      return;
    }
    if (hoursTillTax <= 12) {
      taxAccTimeout = setTimeout(() => {
        taxBankAccounts(lastTerm[0].date);
      }, taxDay.diff(dayjs(), 'ms'));
    }
  }
};
