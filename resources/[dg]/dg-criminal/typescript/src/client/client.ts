import './modules/cornerselling';
import './modules/weed';
import './modules/fence';
import './modules/atm';
import './modules/oxyrun';
import './modules/parkingmeters';
import './modules/methrun';
import './modules/banktruck';

import { startAtmThread } from 'modules/atm/service.atm';

setImmediate(() => {
  startAtmThread();
});
