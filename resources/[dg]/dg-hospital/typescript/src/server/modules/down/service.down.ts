import { Events, Police, Util } from '@dgx/server';
import { downLogger } from './logger.down';

export const revivePlayer = async (plyId: number) => {
  await Police.forceStopInteractions(plyId);

  Events.emitNet('hospital:client:revive', plyId);
  emit('hospital:revive', plyId);

  downLogger.info(`${Util.getName(plyId)} has been revived`);
  Util.Log('hospital:revive', {}, `${Util.getName(plyId)} has been revived`, plyId);
};
