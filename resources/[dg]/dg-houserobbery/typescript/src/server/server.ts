import { Chat, Jobs } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { startPlayerPickingThread } from './services/grouppicker';
import { loadConfig } from 'services/config';

import './services/grouppicker';
import './controllers';

setImmediate(async () => {
  await loadConfig();

  const jobInfo: Jobs.Job = {
    title: 'Huisinbraak',
    size: 4,
    legal: false,
    icon: 'user-secret',
  };
  Jobs.registerJob('houserobbery', jobInfo);

  startPlayerPickingThread();
});

Chat.registerCommand('houserobbery:startJob', '', [], 'developer', (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const cid = Player.PlayerData.citizenid;
  const location = stateManager.getUnusedLocation();
  if (!location) return;
  stateManager.startJobForPly(cid, location);
});
