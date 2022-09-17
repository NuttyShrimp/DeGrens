import './modules';
import './controllers';
import './classes/contextmanager';
import './services/config';

import repository from './services/repository';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';
import { registerContainers } from 'modules/containers/controller.containers';
import shopManager from 'modules/shops/classes/shopmanager';
import { loadConfig } from 'services/config';
import { preloadActivePlayerInventories } from 'modules/inventories/controller.inventories';

setImmediate(async () => {
  // Load config before doing all other thingies!
  await loadConfig();

  repository.deleteNonPersistent();
  itemDataManager.seed();
  registerContainers();
  shopManager.seed();
  preloadActivePlayerInventories();
});
