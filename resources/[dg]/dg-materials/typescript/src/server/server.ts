import { loadConfig } from 'services/config';
import { initializeRadiotowerStates } from 'modules/radiotowers/service.radiotowers';
import { loadContainers } from 'modules/containers/service.containers';
import { initializeRecyclePed } from 'modules/recycleped/service.recycleped';
import { loadMeltingRecipes } from 'services/melting';
import { loadCrafting } from './services/crafting';
import portRobberyManager from 'modules/portrobbery/manager.portrobbery';

import './controllers/events';

import './modules/wirecutting';
import './modules/dumpsters';
import './modules/radiotowers';
import './modules/recycleped';
import './modules/containers';

import './services/melting';
import './services/crafting';

setImmediate(async () => {
  await loadConfig();

  initializeRadiotowerStates();
  initializeRecyclePed();
  loadMeltingRecipes();
  loadCrafting();
  loadContainers();
  portRobberyManager.startCodePedThread();
});
