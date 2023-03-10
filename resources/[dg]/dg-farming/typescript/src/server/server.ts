import { loadConfig } from 'services/config';
import { registerUseableSeeds } from 'services/seeds';

import './controllers';
import './services/config';

setImmediate(async () => {
  await loadConfig();

  registerUseableSeeds();
});
