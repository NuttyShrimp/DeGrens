import { Core, RPC } from '@dgx/server';

import {
  assignModelConfig,
  checkMissingModels,
  getCarboostVehiclePool,
  getConfigByEntity,
  getConfigByModel,
  getModelStock,
  getVehicleModels,
  isInfoLoaded,
} from './service.info';

global.exports('getConfigByModel', getConfigByModel);
global.exports('getConfigByEntity', getConfigByEntity);
global.exports('getVehicleModels', getVehicleModels);
global.exports('isInfoLoaded', isInfoLoaded);
global.exports('getCarboostVehiclePool', getCarboostVehiclePool);

RPC.register('vehicles:info:getModelstock', (src: number, model: string) => {
  return getModelStock(model);
});

RPC.register('vehicles:info:assignConfig', (src, netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (!veh || !DoesEntityExist(veh)) return;
  return assignModelConfig(veh);
});

// We check for first player that is loaded
Core.onPlayerLoaded(({ serverId }) => {
  if (!serverId) return;
  checkMissingModels(serverId);
});

RegisterCommand(
  'checkMissingModels',
  () => {
    const plyId = +GetPlayerFromIndex(0);
    if (!GetPlayerName(String(plyId))) return;
    checkMissingModels(plyId);
  },
  true
);
