import { loadDoors } from 'services/doors';

import './controllers';

setImmediate(() => {
  loadDoors();
});
