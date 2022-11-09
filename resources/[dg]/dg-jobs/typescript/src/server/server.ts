import './services/groups/controller';
import './controllers';
import nameManager from 'services/groups/classes/NameManager';
import { loadLocations } from 'services/signin';

setImmediate(() => {
  loadLocations();
  nameManager.generateAllPlayerNames();
});
