import { RPC } from '@dgx/server';
import { getConfig } from 'services/config';

RPC.register('inventory:server:getDropRange', () => getConfig().locationInvRange.drop);
