import { Inventory, Notifications, RayCast, RPC, Taskbar } from '@dgx/server';

import { getVinForVeh } from '../../helpers/vehicle';
import { fuelManager } from '../fuel/classes/fuelManager';
import { getConfigByEntity } from '../info/service.info';
import { getDoorState, getTyreState, getWindowState } from './helpers.status';

import { updateServiceStatusPart } from './services/store';

export const getNativeStatus = async (veh: number, vin: string): Promise<Vehicle.VehicleStatus> => {
  const status: Vehicle.VehicleStatus = {
    body: 0,
    engine: 0,
    fuel: 0,
    wheels: [],
    windows: [],
    doors: [],
  };

  status.body = GetVehicleBodyHealth(veh);
  status.engine = GetVehicleEngineHealth(veh);
  status.fuel = fuelManager.getFuelLevel(veh) ?? 0;

  status.wheels = await getTyreState(veh);
  status.windows = await getWindowState(veh);
  status.doors = await getDoorState(veh);

  return status;
};

export const generateServiceStatus = (): Service.Status => ({
  engine: 1000,
  axle: 1000,
  brakes: 1000,
  suspension: 1000,
});

export const useRepairPart = async (src: number, type: keyof Service.Status, partClass: string, itemName: string) => {
  const { entity: veh } = await RayCast.doRaycast(src);
  if (!veh || GetEntityType(veh) !== 2) {
    Notifications.add(src, 'Er is geen voertuig in de buurt', 'error');
    return;
  }
  const vehInfo = getConfigByEntity(veh);
  if (!vehInfo) {
    return;
  }
  if (vehInfo.class.at(-1) !== partClass) {
    Notifications.add(src, 'Dit onderdeel past niet op dit voertuig', 'error');
    return;
  }
  const vin = getVinForVeh(veh);
  if (!vin) return;
  let taskAnim: TaskBar.Animation;
  const vehNetId = NetworkGetNetworkIdFromEntity(veh);
  switch (type) {
    case 'brakes': {
      const nearWheel = await RPC.execute<boolean>('vehicles:isNearWheel', src, vehNetId, 1.0);
      if (!nearWheel) {
        Notifications.add(src, 'Je bent niet dicht genoeg bij een wiel', 'error');
        return;
      }
      taskAnim = {
        animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
        anim: 'machinic_loop_mechandplayer',
        flags: 1,
      };
      break;
    }
    default: {
      const nearEngine = await RPC.execute<boolean>('vehicles:isNearEngine', src, vehNetId, 2.5, true);
      if (!nearEngine) {
        Notifications.add(src, 'Je bent niet dicht genoeg bij de motor (Is de motorkap open?)', 'error');
        return;
      }
      taskAnim = {
        animDict: 'mini@repair',
        anim: 'fixing_a_ped',
        flags: 51,
      };
      break;
    }
  }
  const [cancelled] = await Taskbar.create(src, 'car-wrench', 'Repairing', 30000, {
    cancelOnMove: true,
    cancelOnDeath: true,
    canCancel: true,
    disarm: true,
    disableInventory: true,
    animation: taskAnim,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (cancelled) return;
  const couldRemove = await Inventory.removeItemByNameFromPlayer(src, itemName);
  if (couldRemove === false) {
    Notifications.add(src, 'Je hebt dit item niet', 'error');
    return;
  }

  // Reset stalls for every repair
  Entity(veh).state.amountOfStalls = 0;
  updateServiceStatusPart(vin, type, 10);
};
