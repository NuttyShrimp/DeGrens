import './modules';
import './controllers/controller';
import './classes/contextmanager';
import repository from './services/repository';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';
import { registerContainers } from 'modules/containers/controller.containers';
import shopManager from 'modules/shops/classes/shopmanager';

setImmediate(() => {
  repository.deleteNonPersistent();
  itemDataManager.seed();
  registerContainers();
  shopManager.seed();
});
