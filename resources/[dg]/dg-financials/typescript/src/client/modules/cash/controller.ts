import { RPC } from '@dgx/client';

global.asyncExports('getCash', () => {
  return RPC.execute<number>('financials:server:cash:get');
});
