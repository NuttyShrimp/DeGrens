import { Events, RPC } from '@dgx/server';

import { getModelStanceData, saveStance } from './service.stance';

Events.onNet('vehicles:stance:save', (src: number, netId: number) => {
  saveStance(netId);
});

RPC.register('vehicles:stance:getModelData', async (src, model: number) => {
  return getModelStanceData(model);
});
