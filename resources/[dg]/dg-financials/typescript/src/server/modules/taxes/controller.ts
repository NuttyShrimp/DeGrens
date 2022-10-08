import { RPC } from '@dgx/server';
import { getTaxedPrice, getTaxInfo, seedTaxes } from './service';

global.exports('getTaxedPrice', getTaxedPrice);
global.exports('getTaxInfo', getTaxInfo);

RegisterCommand('financials:seed:taxes', () => seedTaxes(), true);

RPC.register('financials:server:taxes:calc', (src, price: number, taxId: number, shouldRemove?: boolean) =>
  getTaxedPrice(price, taxId, shouldRemove)
);
