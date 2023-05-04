import { Core } from '@dgx/server';
import { getReputation, loadPlayerReputation, setReputation, unloadPlayerReputation } from './service.reputation';

Core.onPlayerLoaded(playerData => {
  loadPlayerReputation(playerData.citizenid);
});
Core.onPlayerUnloaded((_, cid) => {
  unloadPlayerReputation(cid);
});

global.exports('getReputation', getReputation);
global.exports('setReputation', setReputation);
