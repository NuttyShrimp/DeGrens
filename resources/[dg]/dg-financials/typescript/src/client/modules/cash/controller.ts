import { RPC } from '@dgx/client';

global.exports('getCash', () => {
  return RPC.execute<number>('financials:server:cash:get');
});
