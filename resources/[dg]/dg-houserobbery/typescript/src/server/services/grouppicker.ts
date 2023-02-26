import { Police } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { PlayerState } from 'enums/states';
import { mainLogger } from 'sv_logger';

export const startPlayerPickingThread = () => {
  setInterval(() => {
    pickLuckyPlayer();
  }, 5 * 60 * 1000);
};

export const pickLuckyPlayer = (skippedPlys: number[] = []) => {
  mainLogger.info('Picking player for houserobbery job');
  if (!Police.canDoActivity('houserobbery')) return;

  const signedInPlayers: number[] = [];
  stateManager.playerStates.forEach((s, cid) => {
    if (s !== PlayerState.WAITING) return; // only waiting plys
    if (skippedPlys.indexOf(cid) !== -1) return; // only plys not already tried
    signedInPlayers.push(cid);
  });
  if (signedInPlayers.length == 0) return;

  const chosenPlyCID = signedInPlayers[Math.floor(Math.random() * signedInPlayers.length)];
  if (!chosenPlyCID) return;

  const houseId = stateManager.getRobableHouse();
  if (!houseId) return;

  const hasStarted = stateManager.startJobForPly(chosenPlyCID, houseId);

  // if started, add to timed out so this player can not get chosen for x time
  // if failed to start, try again but ignore this player
  if (hasStarted) {
    mainLogger.info(`Selected ${chosenPlyCID} for houserobbery job`);
  } else {
    skippedPlys.push(chosenPlyCID);
    pickLuckyPlayer(skippedPlys);
    return;
  }
};
