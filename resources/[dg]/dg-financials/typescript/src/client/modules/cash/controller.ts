import { RPC } from '@dgx/client';

global.asyncExports('getCash', async () => {
  return (await RPC.execute<number>('financials:server:cash:get')) ?? 0;
});
