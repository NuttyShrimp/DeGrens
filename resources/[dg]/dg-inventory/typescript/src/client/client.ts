import './controllers';
import './modules';
import './classes/contextmanager';
import dropsManager from './modules/drops/classes/dropsmanager';
import itemDataManager from 'classes/itemdatamanager';

setImmediate(() => {
  dropsManager.load();
  itemDataManager.seed();
});
