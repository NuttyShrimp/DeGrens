import './controllers/events';
import './controllers/exports';
import './controllers/commands';

import { registerAlertCommands } from 'services/112';

setImmediate(() => {
  registerAlertCommands();
});
