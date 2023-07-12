import './controllers/events';
import './controllers/exports';
import './controllers/commands';
import './helpers/core';

import { registerAlertCommands } from 'services/112';

setImmediate(() => {
  registerAlertCommands();
});
