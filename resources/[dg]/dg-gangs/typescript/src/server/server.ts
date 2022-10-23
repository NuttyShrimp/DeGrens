import gangManager from 'classes/gangmanager';

import './controllers';

setImmediate(() => {
  gangManager.loadAllGangs();
});
