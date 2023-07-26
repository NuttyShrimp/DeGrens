import { executeAction } from './service.actions';

global.exports('executeAction', executeAction);

onNet('sync:request', (action: string, netId: number, args: unknown[]) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  executeAction(action, entity, ...args);
});
