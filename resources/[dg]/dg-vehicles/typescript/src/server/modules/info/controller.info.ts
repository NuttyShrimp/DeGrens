import { RPC } from '@dgx/server';

import {
  assignModelConfig,
  getConfigByEntity,
  getConfigByModel,
  getModelStock,
  getVehicleModels,
} from './service.info';

global.exports('getConfigByModel', getConfigByModel);
global.exports('getConfigByEntity', getConfigByEntity);
global.exports('getVehicleModels', getVehicleModels);

RPC.register('vehicles:info:getModelstock', (src: number, model: string) => {
  return getModelStock(model);
});

RPC.register('vehicles:info:assignConfig', (src, netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (!veh || !DoesEntityExist(veh)) return;
  assignModelConfig(veh);
});
