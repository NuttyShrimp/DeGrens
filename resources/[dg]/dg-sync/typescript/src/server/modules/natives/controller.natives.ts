import { Events } from '@dgx/server';
import { syncExecution } from './service.natives';

global.exports('syncExecution', syncExecution);

Events.onNet('sync:request', (_: number, native: string, netId: number, ...args: any[]) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  syncExecution(native, entity, ...args);
});
