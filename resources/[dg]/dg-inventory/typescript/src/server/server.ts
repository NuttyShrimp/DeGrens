import './modules';
import './controllers';
import './classes/contextmanager';
import './services/config';

import repository from './services/repository';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';
import { registerContainers } from 'modules/containers/controller.containers';
import shopManager from 'modules/shops/shopmanager';
import { setConfig } from 'services/config';
import { preloadActivePlayerInventories } from 'modules/inventories/controller.inventories';
import { Config } from '@dgx/server';

setImmediate(async () => {
  // Load config before doing all other thingies!
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue('inventory.config');
  setConfig(config);

  repository.deleteNonPersistent();
  itemDataManager.seed();
  registerContainers();
  shopManager.seed();
  preloadActivePlayerInventories();
});
