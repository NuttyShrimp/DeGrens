import './modules';
import './controllers';
import './classes/contextmanager';
import './services/config';

import repository from './services/repository';
import itemDataManager from 'classes/itemdatamanager';
import { registerContainers } from 'modules/containers/controller.containers';
import shopManager from 'modules/shops/shopmanager';
import { loadConfig } from 'services/config';
import { preloadActivePlayerInventories } from 'modules/inventories/controller.inventories';

let isLoaded = false;

setImmediate(async () => {
  // Load config before doing all other thingies!
  await loadConfig();

  await repository.deleteNonPersistent();
  await repository.deleteByDestroyDate();
  await itemDataManager.seed();
  registerContainers();
  await shopManager.seed();
  preloadActivePlayerInventories();

  isLoaded = true;
  emit('inventory:loaded');
});

global.exports('isLoaded', () => isLoaded);
