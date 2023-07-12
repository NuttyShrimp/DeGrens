import './modules/cornerselling';
import './modules/weed';
import './modules/fence';
import './modules/atm';
import './modules/oxyrun';
import './modules/parkingmeters';

import { startAtmThread } from 'modules/atm/service.atm';

setImmediate(() => {
  startAtmThread();
});
