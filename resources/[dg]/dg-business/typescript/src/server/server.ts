import { Financials, Config } from '@dgx/server';
import { setConfig } from './services/config';
import { seedBusinesses } from './services/business';

import './controllers/events';
import './controllers/exports';
import './services/business';
import './services/config';

setImmediate(async () => {
  // Load config
  await Config.awaitConfigLoad();
  const config = Config.getModuleConfig<Config.Config>('business');
  await setConfig(config);

  // Wait till accounts loaded before seeding businesses, bankaccounts gets checked when building business
  await Financials.awaitFinancialsLoaded();
  seedBusinesses();
});
