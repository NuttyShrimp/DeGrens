import { Auth, Events, Util } from '@dgx/server';
import config from 'services/config';
import {
  awaitLabsLoaded,
  getActiveLabs,
  getLabIdPlayerIsIn,
  getLabTypeFromId,
  handlePlayerEnteredLab,
  handlePlayerLeftLab,
  lockAllLabs,
} from 'services/labs';
import { mainLogger } from 'sv_logger';

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;

  lockAllLabs();
});

Auth.onAuth(async plyId => {
  awaitLabsLoaded();
  const activeLabs = getActiveLabs();
  if (!activeLabs) return;

  Events.emitNet(
    'labs:client:initLabs',
    plyId,
    config.locations.map(l => l.coords),
    activeLabs
  );
});

Events.onNet('labs:server:logDoor', (plyId: number, labId: number) => {
  const type = getLabTypeFromId(labId);

  const logMsg = `${Util.getName(plyId)}(${plyId}) is at door of lab ${labId} (currently ${type ?? 'not active'})`;
  mainLogger.silly(logMsg);
  Util.Log('labs:atDoor', { type, labId }, logMsg, plyId);
});

Events.onNet('labs:server:entered', (plyId: number, labId: number) => {
  handlePlayerEnteredLab(plyId, labId);
});

Events.onNet('labs:server:left', (plyId: number, labId: number) => {
  handlePlayerLeftLab(plyId, labId);
});

Util.onPlayerUnloaded(plyId => {
  const labId = getLabIdPlayerIsIn(plyId);
  if (labId === undefined) return;
  handlePlayerLeftLab(plyId, labId);
});
