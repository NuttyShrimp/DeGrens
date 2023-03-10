import { getShellTypes } from 'services/config';
import stateManager from '../classes/StateManager';
import { Config, Util, Jobs, Auth, Events } from '@dgx/server';

Jobs.onGroupLeave(plyId => {
  stateManager.cleanupPlayer(plyId);
});

Util.onPlayerUnloaded((plyId, cid) => {
  stateManager.handlePlayerLeft(plyId, cid);
});

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();
  Events.emitNet('houserobbery:server:setShellTypes', plyId, getShellTypes());
});
