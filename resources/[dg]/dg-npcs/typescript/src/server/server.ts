import './controllers/events';
import './controllers/exports';
import './services/config';

import { loadNpcConfig } from './services/config';

setImmediate(() => {
  loadNpcConfig();
});
