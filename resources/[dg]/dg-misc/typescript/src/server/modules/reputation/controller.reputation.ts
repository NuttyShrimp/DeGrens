import { Core } from '@dgx/server';
import { getReputation, loadAllPlayerReputations, loadPlayerReputation, setReputation } from './service.reputation';

Core.onPlayerLoaded(playerData => {
  loadPlayerReputation(playerData.citizenid);
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
