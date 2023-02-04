import { Util } from '@dgx/server';
import { getReputation, loadPlayerReputation, setReputation, unloadPlayerReputation } from './service.reputation';

Util.onPlayerLoaded(playerData => {
  loadPlayerReputation(playerData.citizenid);
});

Util.onPlayerUnloaded((_, cid) => {
  unloadPlayerReputation(cid);
});

global.exports('getReputation', getReputation);
global.exports('setReputation', setReputation);
