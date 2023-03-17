import { Police } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { mainLogger } from 'sv_logger';

export const startPlayerPickingThread = () => {
  setInterval(() => {
    pickLuckyPlayer();
  }, 5 * 60 * 1000);
};

export const pickLuckyPlayer = (skippedCids: number[] = []) => {
  if (!Police.canDoActivity('houserobbery')) {
    mainLogger.info('tried picking player for houserobbery but not enough police');
    return;
  }

  const cids = stateManager.getPossibleTargets(skippedCids);
  if (cids.length == 0) {
    mainLogger.info('tried picking player for houserobbery but no one in queue');
    return;
  }

  const cid = cids[Math.floor(Math.random() * cids.length)];
  if (!cid) return;

  const locationIdx = stateManager.getUnusedLocation();
  if (!locationIdx) {
    mainLogger.info('tried picking player for houserobbery but no unused locations');
    return;
  }

  const hasStarted = stateManager.startJobForPly(cid, locationIdx);

  if (hasStarted) {
    mainLogger.info(`picked player ${cid} for houserobbery`);
  } else {
    mainLogger.info(`could not start houserobbery for player ${cid}`);
    skippedCids.push(cid);
    pickLuckyPlayer(skippedCids);
  }
};
