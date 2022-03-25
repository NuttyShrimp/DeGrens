import './sv_logger';
import './modules/bank/controllers';
import './modules/cash';
import './modules/crypto';
import './modules/paycheck';
import './modules/taxes';
import './modules/debts';

import { AccountManager } from './modules/bank/classes/AccountManager';
import { seedCache as seedCashCache } from './modules/cash/service';
import { reloadPlayerWallets } from './modules/crypto/service';
import { seedCache as seedPaycheckCache } from './modules/paycheck/service';
import { seedTaxes } from './modules/taxes/service';

setImmediate(() => {
  AccountManager.getInstance();
  seedPaycheckCache();
  seedCashCache();
  reloadPlayerWallets();
  seedTaxes();
});
