import { Financials, Config, Inventory } from '@dgx/server';
import { setConfig } from './services/config';
import { seedBusinesses } from './services/business';

import './controllers';
import './modules/blazeit';
import { initializeBlazeIt } from 'modules/blazeit/service.blazeit';

setImmediate(async () => {
  // Load config
  await Config.awaitConfigLoad();
  const config = Config.getModuleConfig<Config.Config>('business');
  await setConfig(config);

  // Wait till accounts loaded before seeding businesses, bankaccounts gets checked when building business
  await Financials.awaitFinancialsLoaded();
  // item labels are needed to build priceItems
  await Inventory.awaitLoad();

  await seedBusinesses();

  // Initialize modules
  initializeBlazeIt();
});
