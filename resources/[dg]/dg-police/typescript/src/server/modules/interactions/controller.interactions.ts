import { RPC } from '@dgx/server';
import { forceStopInteractions } from './service.interactions';

global.asyncExports('forceStopInteractions', forceStopInteractions);
RPC.register('police:interactions:forceStop', forceStopInteractions);
