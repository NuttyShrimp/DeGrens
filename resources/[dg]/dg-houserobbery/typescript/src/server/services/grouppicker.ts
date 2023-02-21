import { Police, Util } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { PlayerState } from 'enums/states';

const timedOutPlayers: number[] = [];

export const startPlayerPickingStash = () => {
  setInterval(() => {
    pickLuckyPlayer();
  }, 5 * 60 * 1000);
};

export const pickLuckyPlayer = (skippedPlys: number[] = []) => {
  if (!Police.canDoActivity('houserobbery')) return;

  const signedInPlayers: number[] = [];
  stateManager.playerStates.forEach((s, cid) => {
    if (s !== PlayerState.WAITING) return;
    signedInPlayers.push(cid);
  });
  if (signedInPlayers.length == 0) return;

  const chosenPlyCID = signedInPlayers[Util.getRndInteger(0, signedInPlayers.length)];
  if (!chosenPlyCID) return;

  if (timedOutPlayers.indexOf(chosenPlyCID) !== -1) {
    skippedPlys.push(chosenPlyCID);
    pickLuckyPlayer(skippedPlys);
    return;
  }

  const houseId = stateManager.getRobableHouse();
  if (!houseId) return;

  const hasStarted = stateManager.startJobForPly(chosenPlyCID, houseId);

  // if started, add to timed out so this player can not get chosen for x time
  // if failed to start, try again but ignore this player
  if (hasStarted) {
    timedOutPlayers.push(chosenPlyCID);
    setTimeout(() => {
      timedOutPlayers.shift();
    }, 45 * 60 * 1000);
  } else {
    skippedPlys.push(chosenPlyCID);
    pickLuckyPlayer(skippedPlys);
    return;
  }
};
