import { Events, Minigames, Notifications, RPC, RayCast, Sync, Taskbar, Util, Vehicles } from '@dgx/client';
import { setDegradationValues } from './constant.status';
import { isCloseToAWheel } from '@helpers/vehicle';
import { getWindowState, getDoorState, getTyreState } from './helpers.status';
import { fixVehicle } from './service.status';

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

Events.onNet('vehicles:client:fixVehicle', (netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  fixVehicle(vehicle);
});

Events.onNet('vehicles:status:useRepairKit', async (itemId: string) => {
  const { entity } = RayCast.doRaycast();
  if (!entity || !IsEntityAVehicle(entity)) {
    Notifications.add('Je staat niet bij een voertuig', 'error');
    return;
  }

  if (!Vehicles.isNearVehiclePlace(entity, 'bonnet', 2)) {
    Notifications.add('Je staat niet bij de motorkap', 'error');
    return;
  }

  const heading = Util.getHeadingToFaceEntity(entity);
  await Util.goToCoords({ ...Util.getPlyCoords(), w: heading }, 2000);

  Sync.executeAction('setVehicleDoorOpen', entity, 4, true);

  const success = await Minigames.keygame(10, 7, 15);
  if (!success) {
    Sync.executeAction('setVehicleDoorOpen', entity, 4, false);
    return;
  }

  const [canceled] = await Taskbar.create('engine', 'Herstellen', 20000, {
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
    animation: {
      animDict: 'mini@repair',
      anim: 'fixing_a_ped',
      flags: 1,
    },
  });
  Sync.executeAction('setVehicleDoorOpen', entity, 4, false);

  if (canceled) return;

  const oldHealth = GetVehicleEngineHealth(entity);
  Events.emitNet('vehicles:status:finishRepairKit', itemId, NetworkGetNetworkIdFromEntity(entity), oldHealth);
});

// important to note that when tyrestate is 0, it means tyre doesnt exist
// broken is -1 health!
Events.onNet('vehicles:status:useTireKit', async (itemId: string) => {
  const { entity } = RayCast.doRaycast();
  if (!entity || !IsEntityAVehicle(entity)) {
    Notifications.add('Je staat niet bij een voertuig', 'error');
    return;
  }

  if (!isCloseToAWheel(entity, 1.2)) {
    Notifications.add('Je staat niet bij een wiel', 'error');
    return;
  }

  const oldTyreState = getTyreState(entity);
  if (oldTyreState.every(health => health === 0 || health > 352)) {
    Notifications.add('Dit voertuig heeft geen kapotte band', 'error');
    return;
  }

  const success = await Minigames.keygame(4, 7, 15);
  if (!success) return;

  const [canceled] = await Taskbar.create('tire', 'Vervangen', 15000, {
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
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 1,
    },
  });
  if (canceled) return;

  Events.emitNet('vehicles:status:finishTireKit', itemId, NetworkGetNetworkIdFromEntity(entity));
});
