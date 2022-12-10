import './controllers';
import './modules';
import './classes/contextmanager';
import './services/cache';

import dropsManager from './modules/drops/classes/dropsmanager';
import itemDataManager from 'classes/itemdatamanager';

setImmediate(() => {
  dropsManager.load();
  itemDataManager.seed();
});
