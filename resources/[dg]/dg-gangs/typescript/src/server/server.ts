import gangManager from 'classes/gangmanager';
import { dispatchCurrentGangToAllClients } from 'helpers';

import './controllers';

setImmediate(() => {
  gangManager.loadAllGangs();
  dispatchCurrentGangToAllClients();
});
