import { checkVehicleRestocks } from 'db/repository';
import { startWaxThread } from 'modules/carwash/service.carwash';
import { loadVehicleInfo } from 'modules/info/service.info';
import vinManager from './modules/identification/classes/vinmanager';
import { loadStanceConfig } from 'modules/stances/service.stance';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

import './controller';
import './modules/keys/controller.keys';
import './modules/fuel/controller.fuel';
import './modules/identification/controller.id';
import './modules/garages/controller.garages';
import './modules/info';
import './modules/bennys';
import './modules/status/controller.status';
import './modules/seatbelts';
import './modules/stances';
import './modules/carwash';
import './modules/upgrades';
import './modules/nos';
import './modules/laptop/controller.laptop';
import './modules/vehicleshop';
import './modules/impound/controller.impound';
import './modules/mechanic/controller.mechanic';
import './services';

setImmediate(() => {
  loadVehicleInfo();
  checkVehicleRestocks();
  vinManager.fetchVins();
  startWaxThread();
  loadStanceConfig();
  upgradesManager.validatePlayerVehicleUpgrades();
  upgradesManager.loadPrices();
});
