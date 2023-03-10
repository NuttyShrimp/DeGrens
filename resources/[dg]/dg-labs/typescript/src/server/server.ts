import { loadConfig } from 'services/config';
import { debugInsidePlayers, initiateLabs } from 'services/labs';
import { loadDefaultWeedPlantsState } from 'modules/weed/service.weed';
import { debugMethState, setAmountOfMethStations } from 'modules/meth/service.meth';

import './controllers';
import './modules/weed';
import './modules/meth';
import './modules/coke';
import './services/config';

setImmediate(async () => {
  await loadConfig();

  initiateLabs();

  loadDefaultWeedPlantsState();
  setAmountOfMethStations();
});

RegisterCommand(
  'labs:debugPlayers',
  () => {
    debugInsidePlayers();
  },
  true
);

RegisterCommand(
  'labs:meth:debug',
  () => {
    debugMethState();
  },
  true
);
