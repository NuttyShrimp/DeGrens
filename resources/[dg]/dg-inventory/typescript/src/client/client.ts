import './controllers';
import './modules';
import './classes/contextmanager';
import './services/cache';

import dropsManager from './modules/drops/classes/dropsmanager';
import itemDataManager from 'classes/itemdatamanager';
import objectsManager from 'modules/objects/classes/objectsmanager';

setImmediate(() => {
  dropsManager.load();
  itemDataManager.seed();
  objectsManager.fetchConfig();
});
