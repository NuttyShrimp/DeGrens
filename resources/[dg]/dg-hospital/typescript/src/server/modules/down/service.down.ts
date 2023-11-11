import { Events, Police, Util } from '@dgx/server';
import { downLogger } from './logger.down';
import { sendToAvailableBed } from 'modules/beds/service.beds';

export const revivePlayer = async (plyId: number) => {
  Events.emitNet('hospital:client:revive', plyId);
  emit('hospital:revive', plyId);

  downLogger.info(`${Util.getName(plyId)} has been revived`);
  Util.Log('hospital:revive', {}, `${Util.getName(plyId)} has been revived`, plyId);
};

export const reviveInBed = async (plyId: number) => {
  await Police.forceUncuff(plyId);
  await Police.forceStopInteractions(plyId);

  const bedTimeout = 20000;
  sendToAvailableBed(plyId, bedTimeout);

  setTimeout(() => {
    revivePlayer(plyId);
  }, bedTimeout * 0.75);
};
