import stateManager from '../classes/StateManager';
import { Config, RPC } from '@dgx/server';

on('dg-jobs:server:groups:playerLeft', (src: number) => {
  stateManager.cleanupPlayer(src);
});

on('DGCore:server:playerUnloaded', (plyId: number, cid: number) => {
  stateManager.cleanupPlayer(plyId, cid);
});

RPC.register('houserobbery:server:getShellTypes', () => {
  return Config.getConfigValue('houserobbery.shellType');
});
