import { Chat, Core, Jobs, Notifications, Util } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { startPlayerPickingThread } from './services/grouppicker';
import { loadConfig } from 'services/config';
import { mainLogger } from 'sv_logger';

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
  const Player = Core.getPlayer(src);
  if (!Player) return;
  const cid = Player.citizenid;
  const location = stateManager.getUnusedLocation();
  if (!location) return;
  stateManager.startJobForPly(cid, location);
});

Chat.registerCommand(
  'reportHouserobbery',
  'Rapporteer je huidige houserobbery locatie als scuffed',
  [],
  'user',
  plyId => {
    const house = stateManager.getAssignedHouseByPlyId(plyId);
    if (!house) {
      Notifications.add(plyId, 'Je hebt geen assigned huis', 'error');
      return;
    }

    const logMsg = `${Util.getName(plyId)}(${plyId}) has reported a houserobbery location as scuffed`;
    Util.Log(
      'houserobbery:scuffedLocation',
      {
        houseLocation: house.location,
      },
      logMsg,
      plyId,
      true
    );
    mainLogger.warn(logMsg);

    Notifications.add(plyId, 'Je hebt de locatie succesvol gerapporteerd', 'success');
  }
);
