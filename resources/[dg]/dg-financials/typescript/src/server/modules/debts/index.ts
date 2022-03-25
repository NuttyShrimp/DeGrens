import './controllers/debts';

import { scheduleMaintenanceFees } from './helpers/debts';

setImmediate(() => {
  scheduleMaintenanceFees();
});
