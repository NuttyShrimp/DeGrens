import { loadConfig } from 'services/config';
import { registerUseableSeeds } from 'services/seeds';

import './controllers';

setImmediate(async () => {
  await loadConfig();

  registerUseableSeeds();
});
