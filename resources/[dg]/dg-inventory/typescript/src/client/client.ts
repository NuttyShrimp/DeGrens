import './controllers';
import './modules';
import './classes/contextmanager';
import './services/cache';

import objectsManager from 'modules/objects/classes/objectsmanager';

setImmediate(() => {
  objectsManager.fetchConfig();
});
