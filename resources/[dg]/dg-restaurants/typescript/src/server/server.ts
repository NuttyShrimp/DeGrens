import { loadConfig } from 'services/config';
import restaurantManager from 'classes/restaurantmanager';
import { Financials, Inventory } from '@dgx/server';

import './controllers';
import './services/config';

setImmediate(async () => {
  await loadConfig();
  await Inventory.awaitLoad(); // we need itemlabels from inv
  await Financials.awaitFinancialsLoaded(); // this ensures all business accs have been loaded

  restaurantManager.loadRestaurants();
});
