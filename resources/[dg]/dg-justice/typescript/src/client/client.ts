import './services/cityhall';

import { buildCityHallZones } from './services/cityhall';

setImmediate(() => {
  buildCityHallZones();
});
