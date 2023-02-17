import { loadConfig } from 'services/config';
import weedPlantManager from 'modules/weed/classes/weedplantmanager';
import { initializeCornerselling } from 'modules/cornerselling/service.cornerselling';
import { initializeFence } from 'modules/fence/service.fence';

import './controllers';
import './modules/cornerselling';
import './modules/weed';
import './modules/blackmoney';
import './modules/fence';

setImmediate(async () => {
  await loadConfig();

  weedPlantManager.fetchAll();
  weedPlantManager.startThreads();
  initializeCornerselling();
  initializeFence();
});
