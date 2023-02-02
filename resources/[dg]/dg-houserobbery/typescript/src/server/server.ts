import { Chat, Jobs, Police, Util } from '@dgx/server';
import stateManager from 'classes/StateManager';

import './controllers';
import './modules';
import { PlayerState } from './enums/states';
import { initializeShop } from 'modules/shop/service.shop';

setImmediate(() => {
  const jobInfo: Jobs.Job = {
    title: 'Huisinbraak',
    size: 4,
    legal: false,
    icon: 'user-secret',
  };
  Jobs.registerJob('houserobbery', jobInfo);
  initializeShop();
});

const pickLuckyPlayer = (skippedPlys: number[] = []) => {
  if (!Police.enoughCopsForActivity('houserobbery')) return;

  const signedInPlayers: number[] = [];
  stateManager.playerStates.forEach((s, cid) => {
    if (s !== PlayerState.WAITING) return;
    signedInPlayers.push(cid);
  });
  if (signedInPlayers.length == 0) return;
  const chosenPlyCID = signedInPlayers[Util.getRndInteger(0, signedInPlayers.length)];
  if (!chosenPlyCID) return;

  const houseId = stateManager.getRobableHouse();
  if (!houseId) return;

  const hasStarted = stateManager.startJobForPly(chosenPlyCID, houseId);
  if (!hasStarted) {
    skippedPlys.push(chosenPlyCID);
    pickLuckyPlayer(skippedPlys);
    return;
  }
};

Chat.registerCommand('houserobbery:startJob', '', [], 'developer', (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const cid = Player.PlayerData.citizenid;
  const houseId = stateManager.getRobableHouse();
  if (!houseId) return;
  stateManager.startJobForPly(cid, houseId);
});

setInterval(() => {
  pickLuckyPlayer();
}, 5 * 60 * 1000);
