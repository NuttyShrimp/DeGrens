import './controllers';
import './services/config';
import './services/shop';
import './services/laptops';
import './services/trolleys';

import { loadConfig } from 'services/config';
import { registerLaptopUsageHandlers } from './services/laptops';
import heistManager from 'classes/heistmanager';

setImmediate(async () => {
  await loadConfig();

  registerLaptopUsageHandlers();
  heistManager.initialize();
});
