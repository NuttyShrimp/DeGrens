import './modules/cornerselling';
import './modules/weed';
import './modules/fence';
import './modules/atm';

import { startAtmThread } from 'modules/atm/service.atm';

setImmediate(() => {
  startAtmThread();
});
