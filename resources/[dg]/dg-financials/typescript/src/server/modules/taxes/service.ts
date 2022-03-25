import { config } from '../../config';

import { taxLogger } from './util';

const taxes: Map<number, Taxes.Tax> = new Map();

export const seedTaxes = async () => {
  const query = `
		SELECT tax_id, tax_name, tax_rate
		FROM taxes
	`;
  const result = await global.exports.oxmysql.executeSync(query);
  if (result) {
    result.forEach((row: any) => {
      taxLogger.debug(`Loading tax ${row.tax_name} with rate ${row.tax_rate}`);
      taxes.set(row.tax_id, { category: row.tax_name, rate: row.tax_rate / 100 });
    });
  }
  for (let i = 0; i < config.taxes.cats.length; i++) {
    const tax = config.taxes.cats[i];
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
    await global.exports.oxmysql.executeSync(query, [taxId, tax.category, tax.rate]);
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
  return { taxPrice: price + price * taxInfo.rate * (shouldRemove ? -1 : 1), taxRate: taxInfo.rate };
};
