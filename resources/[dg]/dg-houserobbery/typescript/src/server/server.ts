import { Chat, Jobs } from '@dgx/server';
import stateManager from 'classes/StateManager';
import './services/grouppicker';

import './controllers';
import { startPlayerPickingStash } from './services/grouppicker';

setImmediate(() => {
  const jobInfo: Jobs.Job = {
    title: 'Huisinbraak',
    size: 4,
    legal: false,
    icon: 'user-secret',
  };
  Jobs.registerJob('houserobbery', jobInfo);

  startPlayerPickingStash();
});

Chat.registerCommand('houserobbery:startJob', '', [], 'developer', (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const cid = Player.PlayerData.citizenid;
  const houseId = stateManager.getRobableHouse();
  if (!houseId) return;
  stateManager.startJobForPly(cid, houseId);
});
