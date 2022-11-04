import './modules/groups/controller';
import './controllers';
import nameManager from 'modules/groups/classes/NameManager';
import { loadLocations } from 'services/signin';

setImmediate(() => {
  loadLocations();
  nameManager.generateAllPlayerNames();
});
