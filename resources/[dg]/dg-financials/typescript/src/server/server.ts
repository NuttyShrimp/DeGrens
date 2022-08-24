import { Config } from '@dgx/server';
import { setConfig } from 'helpers/config';
import { CryptoManager } from 'modules/crypto/classes/CryptoManager';
import debtManager from 'modules/debts/classes/debtmanager';
import { scheduleMaintenanceFees } from 'modules/debts/helpers/debts';

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

const startResource = async () => {
  await Config.awaitConfigLoad();
  const config = Config.getModuleConfig<Config>('financials');
  setConfig(config);
  AccountManager.getInstance().setConfig(config.accounts);
  seedPaycheckCache();
  seedCashCache();
  CryptoManager.getInstance().loadCoins();
  debtManager.setConfig(config.debts);
  reloadPlayerWallets();
  scheduleMaintenanceFees();
  seedTaxes();
};

setImmediate(() => {
  startResource();
});
