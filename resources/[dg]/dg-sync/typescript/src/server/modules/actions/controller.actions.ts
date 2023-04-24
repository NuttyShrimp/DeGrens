import { Events } from '@dgx/server';
import { executeAction } from './service.actions';

global.exports('executeAction', executeAction);

Events.onNet('sync:request', (_: number, native: string, netId: number, ...args: any[]) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  executeAction(native, entity, ...args);
});
