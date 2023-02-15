import { Events, Minigames, RPC, RayCast, Sync, Taskbar, Util } from '@dgx/client';

import { setDegradationValues } from './constant.status';
import { fixVehicle } from './service.status';
import { isCloseToHood } from '@helpers/vehicle';

// Completes the server side function for natives that are client sided only
Events.onNet(
  'vehicles:client:setNativeStatus',
  async (vehNetId: number, status: Partial<Omit<Vehicle.VehicleStatus, 'fuel' | 'body' | 'doors'>>) => {
    // Vehicle handles gets changed sometimes for a fucking reason when spawning, check netid
    const exists = await Util.awaitEntityExistence(vehNetId, true);
    if (!exists) return;
    const vehicle = NetworkGetEntityFromNetworkId(vehNetId);

    if (status.engine !== undefined) {
      SetVehicleEngineHealth(vehicle, status.engine);
    }
    if (status.wheels !== undefined) {
      status.wheels.forEach((wheel, wheelId) => {
        if (wheel === -1) {
          SetTyreHealth(vehicle, wheelId, 351);
          SetVehicleTyreBurst(vehicle, wheelId, true, 1000);
        } else {
          SetTyreHealth(vehicle, wheelId, wheel);
        }
      });
    }
    if (status.windows !== undefined) {
      status.windows.forEach((broken, windowId) => {
        if (!broken) return;
        SmashVehicleWindow(vehicle, windowId);
      });
    }
  }
);

Events.onNet('vehicles:service:setDegradationValues', (values: Service.DegradationConfig) => {
  setDegradationValues(values);
});

RPC.register('vehicles:client:getWindowSate', (netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  const state = [];
  for (let i = 0; i < 8; i++) {
    //@ts-ignore return value is false or 1
    state.push(!(IsVehicleWindowIntact(veh, i) === 1));
  }
  return state;
});

RPC.register('vehicles:client:getDoorSate', (netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  const state = [];
  for (let i = 0; i < 6; i++) {
    //@ts-ignore return value is false or 1
    state.push(IsVehicleDoorDamaged(veh, i) === 1);
  }
  return state;
});

RPC.register('vehicles:client:getTyreState', (netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  const state = [];
  for (let i = 0; i < 10; i++) {
    state.push(IsVehicleTyreBurst(veh, i, true) ? -1 : GetTyreHealth(veh, i));
  }
  return state;
});

Events.onNet('vehicles:client:fixVehicle', (netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  fixVehicle(vehicle);
});

Events.onNet('vehicles:status:useRepairKit', async (itemId: string) => {
  const { entity } = RayCast.doRaycast();
  if (!entity || !IsEntityAVehicle(entity)) return;
  if (!isCloseToHood(entity, 2)) return;

  const heading = Util.getHeadingToFaceEntity(entity);
  await Util.goToCoords({ ...Util.getPlyCoords(), w: heading }, 2000);

  Sync.executeNative('setVehicleDoorOpen', entity, 4, true);

  const success = await Minigames.keygame(10, 7, 15);
  if (!success) {
    Sync.executeNative('setVehicleDoorOpen', entity, 4, false);
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
  Sync.executeNative('setVehicleDoorOpen', entity, 4, false);

  if (canceled) return;

  const oldHealth = GetVehicleEngineHealth(entity);
  Events.emitNet('vehicles:status:finishRepairKit', itemId, NetworkGetNetworkIdFromEntity(entity), oldHealth);
});
