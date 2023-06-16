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

RegisterCommand(
  'addfeedmessage',
  () => {
    gangManager.addFeedMessage({
      title: 'Test',
      content: 'Test',
    });
  },
  false
);
