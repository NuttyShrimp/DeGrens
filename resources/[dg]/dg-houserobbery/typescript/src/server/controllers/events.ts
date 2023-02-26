import stateManager from '../classes/StateManager';
import { Config, Util, Jobs, Auth, Events } from '@dgx/server';

Jobs.onGroupLeave(plyId => {
  stateManager.cleanupPlayer(plyId);
});

Util.onPlayerUnloaded((_, cid) => {
  stateManager.handlePlayerLeft(cid);
});

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();
  const shellTypes = Config.getConfigValue('houserobbery.shellType');
  Events.emitNet('houserobbery:server:setShellTypes', plyId, shellTypes);
});
