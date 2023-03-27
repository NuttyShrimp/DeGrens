import { RPC } from '@dgx/client';
import { isInCarryDuo } from './modules/carry';
import { isGettingEscorted } from './modules/escort';

global.exports('forceStopInteractions', async () => {
  if (!isInCarryDuo() || !isGettingEscorted()) return;
  await RPC.execute('police:interactions:forceStop');
});
