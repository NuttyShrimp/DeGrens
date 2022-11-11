import { getReputation, loadPlayerReputation, setReputation, unloadPlayerReputation } from './service.reputation';

on('DGCore:server:playerLoaded', (playerData: PlayerData) => {
  loadPlayerReputation(playerData.citizenid);
});

on('DGCore:server:playerUnloaded', (plyId: number, cid: number) => {
  unloadPlayerReputation(cid);
});

global.exports('getReputation', getReputation);
global.exports('setReputation', setReputation);
