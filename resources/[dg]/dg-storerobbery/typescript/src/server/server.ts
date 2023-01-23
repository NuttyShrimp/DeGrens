import './modules';
import './controllers/events';

import { loadConfig } from 'helpers/config';

setImmediate(() => {
  loadConfig();
});
