import { getTaxedPrice, seedTaxes } from './service';
import { taxLogger } from './util';

global.exports('getTaxedPrice', getTaxedPrice);

RegisterCommand('financials:seed:taxes', () => seedTaxes(), true);

DGCore.Functions.CreateCallback('financials:server:taxes:calc', (src, cb, data: Taxes.IncomingTax) => {
	taxLogger.debug(`taxes:calc: ${JSON.stringify(data)}`);
	const cbData = getTaxedPrice(data.price, data.taxId);
	taxLogger.debug(`taxes:calc: ${JSON.stringify(cbData)}`);
	cb(cbData);
});
