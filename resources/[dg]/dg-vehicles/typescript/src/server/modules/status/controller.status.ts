import { Events, Inventory, RPC } from '@dgx/server';

import { getConfigByHash } from '../info/service.info';

import { getConfig, loadConfig } from './services/config';
import { getServiceStatus, seedServiceStatuses, updateServiceStatus } from './services/store';
import { generateServiceStatus, useRepairPart } from './service.status';

setImmediate(() => {
  seedServiceStatuses();
  loadConfig();
});

Events.onNet('vehicles:service:updateStatus', (src: number, vehNetId: number, status: Service.Status) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!DoesEntityExist(veh)) return;
  const vin = Entity(veh).state.vin;
  if (!vin) return;
  updateServiceStatus(vin, status);
});

Events.onNet('vehicles:server:requestDegradationValues', async src => {
  const config = await getConfig();
  Events.emitNet('vehicles:service:setDegradationValues', src, config.degradationValues);
});

RPC.register('vehicles:service:getStatus', (src: number, vehNetId: number) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!DoesEntityExist(veh)) return generateServiceStatus();
  const vin = Entity(veh).state.vin;
  if (!vin) return generateServiceStatus();
  return getServiceStatus(vin);
});

RPC.register('vehicles:service:getVehicleInfo', (src: number, vehNetId: number) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  const vehInfo = getConfigByHash(GetEntityModel(veh));
  return {
    name: `${vehInfo?.brand} ${vehInfo?.name}`,
    class: vehInfo?.class ?? 'D',
  };
});

(['engine', 'axle', 'suspension', 'brakes'] as (keyof Service.Status)[]).forEach(part => {
  (['X', 'S', 'A+', 'A', 'B', 'C', 'D'] as CarClass[]).forEach(vehClass => {
    Inventory.registerUseable(`${part}_part_${vehClass.toLowerCase()}`, (src, item) => {
      useRepairPart(src, part, vehClass, item.name);
    });
  });
});
