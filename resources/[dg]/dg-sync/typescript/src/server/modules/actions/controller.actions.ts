import { Events } from '@dgx/server';
import { executeAction } from './service.actions';

global.exports('executeAction', executeAction);

Events.onNet('sync:request', (_: number, action: string, netId: number, args: unknown[]) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  executeAction(action, entity, ...args);
});
