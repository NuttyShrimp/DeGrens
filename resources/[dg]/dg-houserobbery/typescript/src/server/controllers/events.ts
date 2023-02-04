import stateManager from '../classes/StateManager';
import { Config, RPC, Util } from '@dgx/server';

on('dg-jobs:server:groups:playerLeft', (src: number) => {
  stateManager.cleanupPlayer(src);
});

Util.onPlayerUnloaded((plyId, cid) => {
  stateManager.cleanupPlayer(plyId, cid);
});

RPC.register('houserobbery:server:getShellTypes', () => {
  return Config.getConfigValue('houserobbery.shellType');
});
