import { getShellTypes } from 'services/config';
import stateManager from '../classes/StateManager';
import { Config, Jobs, Auth, Events, Core } from '@dgx/server';

Jobs.onGroupLeave((plyId, cid) => {
  stateManager.finishJobForPly(plyId, cid, true);
});

Core.onPlayerUnloaded((plyId, cid) => {
  stateManager.handlePlayerLeft(plyId, cid);
});

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();
  Events.emitNet('houserobbery:server:setShellTypes', plyId, getShellTypes());
});
