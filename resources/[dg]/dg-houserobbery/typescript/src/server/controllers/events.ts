import stateManager from '../classes/StateManager';
import { Config, RPC, Util, Jobs, Auth, Events } from '@dgx/server';

Jobs.onGroupLeave((plyId, cid) => {
  stateManager.cleanupPlayer(plyId, cid);
});

Util.onPlayerUnloaded((plyId, cid) => {
  stateManager.cleanupPlayer(plyId, cid);
});

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();
  const shellTypes = Config.getConfigValue('houserobbery.shellType');
  Events.emitNet('houserobbery:server:setShellTypes', plyId, shellTypes);
});
