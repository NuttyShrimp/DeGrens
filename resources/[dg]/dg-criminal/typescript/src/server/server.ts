import { loadConfig } from 'services/config';
import { fetchAllPlants, startWeedThreads } from 'modules/weed/service.weed';
import { initializeCornerselling } from 'modules/cornerselling/service.cornerselling';

import './controllers';
import './modules/cornerselling';
import './modules/weed';
import './modules/blackmoney';

setImmediate(async () => {
  await loadConfig();

  fetchAllPlants();
  startWeedThreads();
  initializeCornerselling();
});
