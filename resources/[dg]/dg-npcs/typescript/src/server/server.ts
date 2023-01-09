import './controllers/events';
import './services/config';

import { loadNpcConfig } from './services/config';

setImmediate(() => {
  loadNpcConfig();
});
