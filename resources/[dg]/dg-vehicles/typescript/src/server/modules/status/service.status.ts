import { Inventory, Notifications, RayCast, RPC, Taskbar, Util, Sync } from '@dgx/server';
import { getVinForVeh } from '../../helpers/vehicle';
import { fuelManager } from '../fuel/classes/fuelManager';
import { getConfigByEntity } from '../info/service.info';
import { getDoorState, getTyreState, getWindowState } from './helpers.status';
import { getServiceStatus, updateServiceStatus } from './services/store';

let percentagePerPart = 1;
export const setPercentagePerPart = (percentage: number) => {
  percentagePerPart = percentage;
};

export const getNativeStatus = async (veh: number, vin: string): Promise<Vehicle.VehicleStatus> => {
  const status: Vehicle.VehicleStatus = {
    body: 0,
    engine: 0,
    fuel: 0,
    wheels: [],
    windows: [],
    doors: [],
  };

  status.body = Math.min(GetVehicleBodyHealth(veh), 1000);
  status.engine = Math.min(GetVehicleEngineHealth(veh), 1000);
  status.fuel = fuelManager.getFuelLevel(veh);

  const wheelPromise = getTyreState(veh);
  const windowPromise = getWindowState(veh);
  const doorsPromise = getDoorState(veh);

  const [wheels, windows, doors] = await Promise.all([wheelPromise, windowPromise, doorsPromise]);

  status.wheels = wheels;
  status.windows = windows;
  status.doors = doors;

  return status;
};

export const setNativeStatus = (vehicle: number, status: Partial<Omit<Vehicle.VehicleStatus, 'fuel'>>) => {
  Sync.executeAction('vehicles:status:setNative', vehicle, status);
};

export const useRepairPart = async (src: number, type: Service.Part, itemState: Inventory.ItemState) => {
  const { entity: veh } = await RayCast.doRaycast(src);
  if (!veh || GetEntityType(veh) !== 2) {
    Notifications.add(src, 'Er is geen voertuig in de buurt', 'error');
    return;
  }

  if (Util.getPlayersInVehicle(veh).length !== 0) {
    Notifications.add(src, 'Je kan niet aan een voertuig werken als er iemand inzit', 'error');
    return;
  }

  const vehInfo = getConfigByEntity(veh);
  if (!vehInfo) return;
  const vin = getVinForVeh(veh);
  if (!vin) return;

  const partClass: CarClass = itemState.metadata?.class ?? 'D';
  if (vehInfo.class !== partClass) {
    Notifications.add(src, 'Dit onderdeel past niet op dit voertuig', 'error');
    return;
  }

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

  const [cancelled] = await Taskbar.create(src, 'car-wrench', 'Repairing', 10000, {
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

  if (Util.getPlayersInVehicle(veh).length !== 0) {
    Notifications.add(src, 'Je kan niet aan een voertuig werken als er iemand inzit', 'error');
    return;
  }

  const couldRemove = await Inventory.removeItemByIdFromPlayer(src, itemState.id);
  if (!couldRemove) {
    Notifications.add(src, 'Je hebt dit item niet', 'error');
    return;
  }

  // Reset stalls for every repair
  const entState = Entity(veh).state;
  entState.set('amountOfStalls', 0, true);
  entState.set('undriveable', false, true);

  const status = getServiceStatus(vin);
  const oldPartValue = status[type];
  const newPartValue = oldPartValue + getPartRepairAmount(oldPartValue);
  Util.Log(
    'vehicles:status:updatePart',
    {
      vin,
      type,
      oldPartValue,
      newPartValue,
    },
    `${Util.getName(src)} has updated a ${type} of a vehicle to ${newPartValue}`
  );
  updateServiceStatus(vin, { ...status, [type]: newPartValue });
};

export const getPartRepairAmount = (partValue: number) => {
  const addition = (1000 - partValue) * percentagePerPart;
  return Math.max(addition, 50);
};

export const calculateNeededParts = (partValue: number) => {
  let amount = 0;
  // fail safe of 10
  while (amount < 10) {
    if (partValue >= 1000) break;

    partValue += getPartRepairAmount(partValue);
    amount++;
  }
  return amount;
};

export const clearVehicleStalls = (vehicle: number) => {
  const entState = Entity(vehicle).state;
  entState.set('amountOfStalls', 0, true);
  entState.set('undriveable', false, true);
};
