import './sv_logger';
import './modules/bank/controllers';
import './modules/cash';
import './modules/crypto';
import './modules/paycheck';
import './modules/taxes';
import './modules/debts';

import { Config, Util } from '@dgx/server';
import { setConfig } from 'helpers/config';
import cryptoManager from 'modules/crypto/classes/CryptoManager';
import debtManager from 'modules/debts/classes/debtmanager';
import { scheduleMaintenanceFees } from 'modules/debts/helpers/maintenanceFees';
import accountManager from './modules/bank/classes/AccountManager';
import { seedCache as seedPaycheckCache, startPaycheckInterval } from './modules/paycheck/service';
import { seedTaxes } from './modules/taxes/service';

let financialsLoaded = false;
global.asyncExports('awaitFinancialsLoaded', () => {
  return Util.awaitCondition(() => financialsLoaded);
});

setImmediate(async () => {
  // First we load config
  await Config.awaitConfigLoad();
  const config = Config.getModuleConfig<Config>('financials');
  setConfig(config);
  await accountManager.init();
  await seedPaycheckCache();
  startPaycheckInterval();
  await cryptoManager.initiate();
  await debtManager.seedDebts();
  await scheduleMaintenanceFees();
  await seedTaxes();

  financialsLoaded = true;
});
