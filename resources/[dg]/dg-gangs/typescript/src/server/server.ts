import gangManager from 'classes/gangmanager';
import { dispatchCurrentGangToAllClients } from 'helpers';

import './controllers';
import './services/core';
import './services/keys';

setImmediate(async () => {
  await gangManager.loadAllGangs();
  await gangManager.fetchFeedMessages();
  dispatchCurrentGangToAllClients();
});
