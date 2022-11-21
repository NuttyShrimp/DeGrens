import { RPC } from '@dgx/server';
import { awaitConfig, getConfig } from 'services/config';

RPC.register('criminal:getConfig', async () => {
  await awaitConfig();
  return getConfig();
});
