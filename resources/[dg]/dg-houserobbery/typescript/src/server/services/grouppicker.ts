import { Police } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { mainLogger } from 'sv_logger';

export const startPlayerPickingThread = () => {
  setInterval(() => {
    pickLuckyPlayer();
  }, 5 * 60 * 1000);
};

export const pickLuckyPlayer = (skippedCids: number[] = []) => {
  mainLogger.info('Picking player for houserobbery job');
  if (!Police.canDoActivity('houserobbery')) return;

  const cids = stateManager.getPossibleTargets(skippedCids);
  if (cids.length == 0) return;

  const cid = cids[Math.floor(Math.random() * cids.length)];
  if (!cid) return;

  const locationIdx = stateManager.getUnusedLocation();
  if (!locationIdx) return;

  const hasStarted = stateManager.startJobForPly(cid, locationIdx);

  // if started, add to timed out so this player can not get chosen for x time
  // if failed to start, try again but ignore this player
  if (hasStarted) {
    mainLogger.info(`Selected ${cid} for houserobbery job`);
  } else {
    skippedCids.push(cid);
    pickLuckyPlayer(skippedCids);
    return;
  }
};
