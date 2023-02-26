import { Chat, Jobs, Util } from '@dgx/server';
import stateManager from 'classes/StateManager';
import './services/grouppicker';

import './controllers';
import { startPlayerPickingThread } from './services/grouppicker';

setImmediate(() => {
  const jobInfo: Jobs.Job = {
    title: 'Huisinbraak',
    size: 4,
    legal: false,
    icon: 'user-secret',
  };
  Jobs.registerJob('houserobbery', jobInfo);

  startPlayerPickingThread();
});
