import stateManager from '../classes/StateManager';
import { Config, RPC, Util, Jobs } from '@dgx/server';

Jobs.onGroupLeave((plyId, cid) => {
  stateManager.cleanupPlayer(plyId, cid);
});

Util.onPlayerUnloaded((plyId, cid) => {
  stateManager.cleanupPlayer(plyId, cid);
});

RPC.register('houserobbery:server:getShellTypes', () => {
  return Config.getConfigValue('houserobbery.shellType');
});
