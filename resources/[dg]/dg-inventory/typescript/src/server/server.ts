import './modules';
import './controllers';
import './classes/contextmanager';
import './services/config';

import repository from './services/repository';
import itemDataManager from 'classes/itemdatamanager';
import { registerContainers } from 'modules/containers/service.containers';
import shopManager from 'modules/shops/shopmanager';
import { loadConfig } from 'services/config';
import { preloadActivePlayerInventories } from 'modules/inventories/controller.inventories';
import { loadNoDropZones } from 'services/nodropzones';

let isLoaded = false;

setImmediate(async () => {
  // Load config before doing all other thingies!
  await loadConfig();

  try {
    await repository.deleteNonPersistent();
    await repository.deleteByDestroyDate();
  } catch (e) {
    console.error(e);
  }
  itemDataManager.seed();
  registerContainers();
  await shopManager.seed();
  preloadActivePlayerInventories();
  loadNoDropZones();

  isLoaded = true;
  emit('inventory:loaded');
});

global.exports('isLoaded', () => isLoaded);
