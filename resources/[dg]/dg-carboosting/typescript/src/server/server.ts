import './helpers';
import './controllers';

import { loadConfig } from 'helpers/config';
import { loadPool } from 'helpers/pool';
import contractManager from 'classes/contractmanager';
import { Jobs } from '@dgx/server';

setImmediate(async () => {
  await loadConfig();

  Jobs.registerJob('carboosting', {
    title: 'Boosting',
    icon: 'car',
    size: 6,
    legal: false,
  });

  loadPool();
  contractManager.startGlobalContractSchedulingThread();
});
