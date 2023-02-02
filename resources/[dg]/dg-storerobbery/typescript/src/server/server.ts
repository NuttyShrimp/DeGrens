import './controllers';
import './modules/registers';
import './modules/safes';

import { loadConfig } from 'helpers/config';

setImmediate(() => {
  loadConfig();
});
