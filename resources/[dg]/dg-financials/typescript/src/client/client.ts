import './modules/bank';
import './modules/cash';
import './modules/payconiq';

import { registerPeekZones } from './modules/bank/service';
import locationManager from 'classes/LocationManager';

setImmediate(() => {
  locationManager.initLocation();
  registerPeekZones();
});
