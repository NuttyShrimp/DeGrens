import blackoutManager from 'classes/BlackoutManager';
import { loadConfig } from './services/config';

import './services/config';
import './controllers';

setImmediate(async () => {
  await loadConfig();

  blackoutManager.initiate();
});
