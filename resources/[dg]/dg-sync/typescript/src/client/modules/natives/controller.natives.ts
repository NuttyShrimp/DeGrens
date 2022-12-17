import { Events } from '@dgx/client/classes';
import { syncExecution } from './service.natives';
import { ACTIONS } from './constants.natives';

global.exports('syncExecution', syncExecution);

Events.onNet('sync:execute', (native: keyof typeof ACTIONS, netId: number, ...args: any[]) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  syncExecution(native, entity, ...args);
});
