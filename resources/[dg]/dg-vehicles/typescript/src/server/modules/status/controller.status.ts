import { Events, Inventory, RPC, Util } from '@dgx/server';

import { getConfigByHash } from '../info/service.info';

import { getConfig, loadConfig } from './services/config';
import { getServiceStatus, seedServiceStatuses, updateServiceStatus } from './services/store';
import { generateServiceStatus, useRepairPart } from './service.status';
import { getTyreState } from './helpers.status';
import { setNativeStatus } from 'helpers/vehicle';

setImmediate(() => {
  seedServiceStatuses();
  loadConfig();
});

Events.onNet('vehicles:service:updateStatus', (src: number, vin: string, status: Service.Status) => {
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

// for some reason if you wanna pop 0 or 4 you also need to pop those other ones :shrug:
const LINKED_TYRE_IDS: Record<number, number> = { 0: 6, 4: 7 };
global.exports('popTyre', async (vehicle: number) => {
  const wheelStatus = await getTyreState(vehicle);
  if (!wheelStatus) return;
  for (let i = 0; i < wheelStatus.length; i++) {
    if (wheelStatus[i] === 1000) {
      wheelStatus[i] = -1;
      const linked = LINKED_TYRE_IDS[i];
      if (linked) {
        wheelStatus[linked] = -1;
      }
      break;
    }
  }
  setNativeStatus(vehicle, { wheels: wheelStatus });
});
