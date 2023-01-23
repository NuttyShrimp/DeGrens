import lockersManager from './classes/LockersManager';
import { loadConfig } from './services/config';

import './controllers/events';
import './services/config';

setImmediate(async () => {
  await loadConfig();

  lockersManager.loadLockers();
});
