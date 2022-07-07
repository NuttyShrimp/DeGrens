import './events';
import './exports';
import './commands';
import { loadLocations } from '../services/signin';

setImmediate(() => {
  loadLocations();
});
