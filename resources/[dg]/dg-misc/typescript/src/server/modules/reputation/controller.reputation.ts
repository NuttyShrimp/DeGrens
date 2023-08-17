import { Core } from '@dgx/server';
import {
  getReputation,
  loadAllPlayerReputations,
  loadPlayerReputation,
  setReputation,
  unloadPlayerReputation,
} from './service.reputation';

Core.onPlayerLoaded(playerData => {
  loadPlayerReputation(playerData.citizenid);
});
Core.onPlayerUnloaded((_, cid) => {
  unloadPlayerReputation(cid);
});

global.exports('getReputation', getReputation);
global.exports('setReputation', setReputation);

RegisterCommand(
  'reload_reputations',
  () => {
    loadAllPlayerReputations();
  },
  true
);
