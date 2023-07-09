import stateManager from 'classes/StateManager';
import { mainLogger } from 'sv_logger';

export const startPlayerPickingThread = () => {
  setInterval(() => {
    pickLuckyPlayer();
  }, 5 * 60 * 1000);
};

export const pickLuckyPlayer = (skippedCids: number[] = []) => {
  const cids = stateManager.getPossibleTargets(skippedCids);
  if (cids.length == 0) {
    mainLogger.info('tried picking player for houserobbery but no one in queue');
    return;
  }

  const cid = cids[Math.floor(Math.random() * cids.length)];
  if (!cid) return;

  const location = stateManager.getUnusedLocation();
  if (!location) {
    mainLogger.info('tried picking player for houserobbery but no unused locations');
    return;
  }

  const hasStarted = stateManager.startJobForPly(cid, location);

  if (hasStarted) {
    mainLogger.info(`picked player ${cid} for houserobbery`);
  } else {
    mainLogger.info(`could not start houserobbery for player ${cid}`);
    skippedCids.push(cid);
    pickLuckyPlayer(skippedCids);
  }
};
