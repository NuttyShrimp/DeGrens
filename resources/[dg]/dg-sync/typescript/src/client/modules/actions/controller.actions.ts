import { Events } from '@dgx/client/classes';
import { executeAction, registerActionHandler, unregisterActionHandler } from './service.actions';

global.exports('executeAction', executeAction);

Events.onNet('sync:execute', (action: string, netId: number, ...args: any[]) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  executeAction(action, entity, ...args);
});

global.exports('registerActionHandler', registerActionHandler);
global.exports('unregisterActionHandler', unregisterActionHandler);
