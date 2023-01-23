import blackoutManager from 'classes/BlackoutManager';

import './controllers';

setImmediate(() => {
  // initialize as no blackout
  blackoutManager.setStatebag(false);
});
