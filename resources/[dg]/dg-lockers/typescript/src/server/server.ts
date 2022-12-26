import lockersManager from './classes/LockersManager';

import './services/config';
import { loadConfig } from './services/config';

setImmediate(async () => {
  await loadConfig();

  lockersManager.loadLockers();
});
