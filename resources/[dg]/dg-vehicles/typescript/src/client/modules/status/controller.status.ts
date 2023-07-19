import { Events, Minigames, Notifications, RPC, RayCast, Sync, Taskbar, Util, Vehicles } from '@dgx/client';
import { REPAIR_ITEMS, setDegradationValues } from './constant.status';
import { isCloseToAWheel } from '@helpers/vehicle';
import { getWindowState, getDoorState, getTyreState } from './helpers.status';
import { setNativeStatus } from './service.status';
import { generatePerfectNativeStatus } from '@shared/status/helpers.status';
import { getVehicleFuel, overrideSetFuel } from 'modules/fuel/service.fuel';

Sync.registerActionHandler(
  'vehicles:statis:setNative',
  async (vehicle, status: Partial<Omit<Vehicle.VehicleStatus, 'fuel'>>) => {
    if (status.body !== undefined) {
      if (status.body === 1000) {
        SetVehicleDeformationFixed(vehicle);
      }
      SetVehicleBodyHealth(vehicle, status.body);
    }

    if (status.engine !== undefined) {
      SetVehicleEngineHealth(vehicle, status.engine);
    }

    if (status.doors !== undefined) {
      status.doors.forEach((broken, doorId) => {
        if (!broken) return; // no native to fix sadly
        SetVehicleDoorBroken(vehicle, doorId, true);
      });
    }

    if (status.wheels !== undefined) {
      status.wheels.forEach((health, wheelId) => {
        if (health === -1) {
          SetTyreHealth(vehicle, wheelId, 351);
          SetVehicleTyreBurst(vehicle, wheelId, true, 1000);
        } else {
          if (health === 1000) {
            SetVehicleTyreFixed(vehicle, wheelId);
          }
          SetTyreHealth(vehicle, wheelId, health);
        }
      });
    }

    if (status.windows !== undefined) {
      status.windows.forEach((broken, windowId) => {
        if (broken) {
          SmashVehicleWindow(vehicle, windowId);
        } else {
          FixVehicleWindow(vehicle, windowId);
        }
      });
    }
  }
);

Events.onNet('vehicles:service:setDegradationValues', (values: Service.DegradationConfig) => {
  setDegradationValues(values);
});

RPC.register('vehicles:client:getWindowState', (netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return [];
  return getWindowState(vehicle);
});

RPC.register('vehicles:client:getDoorState', (netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return [];
  return getDoorState(vehicle);
});

RPC.register('vehicles:client:getTyreState', (netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return [];
  return getTyreState(vehicle);
});

Sync.registerActionHandler('vehicles:status:fix', (vehicle: number, keepTyreState = false) => {
  const tyreState = keepTyreState ? getTyreState(vehicle) : null;

  setNativeStatus(vehicle, generatePerfectNativeStatus());

  // SetVehicleFixed native modifies fuel
  const fuelLevel = getVehicleFuel(vehicle);
  SetVehicleFixed(vehicle);
  overrideSetFuel(vehicle, fuelLevel);

  if (tyreState) {
    setNativeStatus(vehicle, { wheels: tyreState });
  }
});

Events.onNet('vehicles:status:useRepairItem', async (itemName: string, itemId: string) => {
  const vehicle = RayCast.doRaycast().entity;
  if (!vehicle || !IsEntityAVehicle(vehicle)) {
    Notifications.add('Je staat niet bij een voertuig', 'error');
    return;
  }

  const repairKitData = REPAIR_ITEMS[itemName];
  if (!repairKitData) throw new Error(`Unknown repair item ${itemName}`);

  switch (itemName) {
    case 'repair_kit':
    case 'advanced_repair_kit':
      if (!Vehicles.isNearVehiclePlace(vehicle, 'bonnet', 2)) {
        Notifications.add('Je staat niet bij de motorkap', 'error');
        return;
      }
      break;
    case 'tire_repair_kit':
      if (!isCloseToAWheel(vehicle, 1.2)) {
        Notifications.add('Je staat niet bij een wiel', 'error');
        return;
      }
      if (getTyreState(vehicle).every(health => health === 0 || health > 352)) {
        Notifications.add('Dit voertuig heeft geen kapotte band', 'error');
        return;
      }
      break;
  }

  let openedBonnet = false;
  if (itemName === 'repair_kit' || itemName === 'advanced_repair_kit') {
    const heading = Util.getHeadingToFaceEntity(vehicle);
    await Util.goToCoords({ ...Util.getPlyCoords(), w: heading }, 2000);

    openedBonnet = true;
    Sync.executeAction('setVehicleDoorOpen', vehicle, 4, true);
  }

  const success = await Minigames.keygame(...repairKitData.keygame);
  if (!success) {
    if (openedBonnet) {
      Sync.executeAction('setVehicleDoorOpen', vehicle, 4, false);
    }
    return;
  }

  const [canceled] = await Taskbar.create(
    repairKitData.taskbar.icon,
    repairKitData.taskbar.label,
    repairKitData.taskbar.time,
    {
      canCancel: true,
      cancelOnDeath: true,
      cancelOnMove: true,
      disableInventory: true,
      disablePeek: true,
      disarm: true,
      controlDisables: {
        carMovement: true,
        movement: true,
        combat: true,
      },
      animation: repairKitData.taskbar.animation,
    }
  );

  if (openedBonnet) {
    Sync.executeAction('setVehicleDoorOpen', vehicle, 4, false);
  }

  if (canceled) return;

  const data: Record<string, any> = {};
  switch (itemName) {
    case 'repair_kit':
      data.oldHealth = GetVehicleEngineHealth(vehicle);
      break;
  }

  Events.emitNet(
    'vehicles:status:finishRepairItemUsage',
    itemId,
    itemName,
    NetworkGetNetworkIdFromEntity(vehicle),
    data
  );
});
