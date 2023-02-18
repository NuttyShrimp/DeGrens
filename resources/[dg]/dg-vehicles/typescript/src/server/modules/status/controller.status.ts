import { Auth, Events, Inventory, Notifications, RPC, Config } from '@dgx/server';
import { getConfigByEntity } from '../info/service.info';
import { getConfig, loadConfig } from './services/config';
import { getServiceStatus, seedServiceStatuses, updateServiceStatus } from './services/store';
import { generateServiceStatus, useRepairPart } from './service.status';
import { getTyreState } from './helpers.status';
import { getVinForVeh, setNativeStatus } from 'helpers/vehicle';

setImmediate(() => {
  seedServiceStatuses();
  loadConfig();
});

Events.onNet('vehicles:service:updateStatus', (src: number, vin: string, status: Service.Status) => {
  updateServiceStatus(vin, status);
});

Auth.onAuth(async plyId => {
  const config = await getConfig();
  Events.emitNet('vehicles:service:setDegradationValues', plyId, config.degradationValues);
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
  const vehInfo = getConfigByEntity(veh);
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

Inventory.registerUseable('repair_kit', (plyId, itemState) => {
  if (GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false)) return;
  Events.emitNet('vehicles:status:useRepairKit', plyId, itemState.id);
});

Events.onNet('vehicles:status:finishRepairKit', async (plyId, itemId: string, netId: number, oldHealth: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const removed = await Inventory.removeItemByIdFromPlayer(plyId, itemId);
  if (!removed) {
    Notifications.add(plyId, 'Je hebt geen repairkit', 'error');
    return;
  }

  const increase = Config.getConfigValue<number>('vehicles.config.repairKitAmount');
  if (!increase) return;

  // Reset stalls for every repair
  Entity(vehicle).state.amountOfStalls = 0;
  setNativeStatus(vehicle, {
    engine: oldHealth + increase,
  });
});

global.exports('clearServiceStatus', (vehicle: number) => {
  const vin = getVinForVeh(vehicle);
  if (!vin) return;
  updateServiceStatus(vin, {
    axle: 1000,
    brakes: 1000,
    engine: 1000,
    suspension: 1000,
  });
});
