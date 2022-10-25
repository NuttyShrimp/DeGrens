import { Config, Events, RPC } from '@dgx/server';

import { saveStance } from './service.stance';

Events.onNet('vehicles:stance:save', (src: number, netId: number) => {
  saveStance(netId);
});

RPC.register('vehicles:stance:getModelData', async (src, model: number) => {
  await Config.awaitConfigLoad();
  const config: Stance.Model[] = Config.getConfigValue('vehicles.stance');
  return config.filter(c => GetHashKey(c.model) === model);
});
