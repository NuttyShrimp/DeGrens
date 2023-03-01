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
  const shellInfo = Config.getConfigValue('houserobbery.shellInfo');
  Events.emitNet(
    'houserobbery:server:setShellTypes',
    plyId,
    Object.entries(shellInfo).reduce<Record<string, string>>((acc, [name, shell]: [string, any]) => {
      acc[name] = shell.plan;
      return acc;
    }, {})
  );
});
