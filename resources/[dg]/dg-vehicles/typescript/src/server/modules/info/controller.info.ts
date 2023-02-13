import { RPC } from '@dgx/server';

import { getConfigByEntity, getConfigByHash, getConfigByModel, getModelStock, getVehicleModels } from './service.info';

global.exports('getConfigByModel', getConfigByModel);
global.exports('getConfigByHash', getConfigByHash);
global.exports('getConfigByEntity', getConfigByEntity);
global.exports('getVehicleModels', getVehicleModels);

RPC.register('vehicles:info:getModeltock', (src: number, model: string) => {
  return getModelStock(model);
});
