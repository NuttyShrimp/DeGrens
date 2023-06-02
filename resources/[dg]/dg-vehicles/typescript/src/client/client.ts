import { loadCarwashZones } from 'modules/carwash/zones.carwash';
import { buildQuicksellZone } from 'modules/vehicleshop/services/quicksell.vehicleshop';

import './controllers';
import './modules/keys/controller.keys';
import './modules/bennys';
import './modules/fuel/controllers';
import './modules/garages/controller.garages';
import './modules/status/controller.status';
import './modules/upgrades';
import './modules/dev/controller.dev';
import './modules/seatbelts';
import './modules/stances';
import './modules/carwash';
import './modules/nos';
import './modules/laptop/controller.laptop';
import './modules/vehicleshop';
import './modules/impound/controller.impound';
import './modules/mechanic/controller.mechanic';
import './modules/identification';
import './modules/sirens';
import './services';

setImmediate(() => {
  loadCarwashZones();
  buildQuicksellZone();
});
