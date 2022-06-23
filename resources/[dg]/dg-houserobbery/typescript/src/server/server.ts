import { Chat, Util } from '@dgx/server';
import stateManager from 'classes/StateManager';

import './controllers';
import './modules';
import { PlayerState } from './enums/states';

setImmediate(() => {
  const jobInfo: Jobs.Job = {
    title: 'Huisinbraak',
    size: 4,
    legal: false,
    icon: 'fa-user-secret',
    payout: {
      max: 100,
      min: 50,
      groupPercent: 0,
    },
  };
  global.exports['dg-jobs'].registerJob('houserobbery', jobInfo);
});

const pickLuckyPlayer = (skippedPlys: number[] = []) => {
  const requiredPolice = 0;
  if (global.exports['qb-policejob'].getAmountOfCops() < requiredPolice) return;

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

Chat.registerCommand('houserobbery:startJob', '', [], 'god', (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const cid = Player.PlayerData.citizenid;
  const houseId = stateManager.getRobableHouse();
  stateManager.startJobForPly(cid, houseId);
});

setInterval(() => {
  pickLuckyPlayer();
}, 5 * 60 * 1000);
