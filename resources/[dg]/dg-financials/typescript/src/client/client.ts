import './modules/bank';
import './modules/cash';

import { LocationManager } from './classes/LocationManager';
import { registerPeekZones } from './modules/bank/service';

setImmediate(() => {
  LocationManager.getInstance().initLocation();
  registerPeekZones();
});
