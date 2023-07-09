import { Events, Inventory, Notifications, RayCast, RPC, Taskbar, UI, Util } from '@dgx/client';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';

let usingCarwash = false;

export const useCarwash = async () => {
  if (usingCarwash) {
    Notifications.add('Je bent je voertuig al aan het wassen', 'error');
    return;
  }

  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) return;

  const hasPaid = await RPC.execute<boolean>('vehicles:carwash:payForCarwash');
  if (!hasPaid) {
    Notifications.add('Je hebt niet genoeg cash', 'error');
    return;
  }

  usingCarwash = true;
  UI.closeApplication('interaction');
  await Taskbar.create('spray-can-sparkles', 'Cleaning Vehicle', 10000, {
    canCancel: false,
    controlDisables: {
      carMovement: true,
      combat: true,
      movement: true,
    },
  });

  const netId = NetworkGetNetworkIdFromEntity(veh);
  Events.emitNet('vehicles:carwash:clean', netId);
  usingCarwash = false;
};

export const useCleaningKit = async () => {
  if (getCurrentVehicle()) {
    Notifications.add('Je kan dit niet van in een voertuig', 'error');
    return;
  }

  const { entity: veh } = RayCast.doRaycast();
  if (
    !veh ||
    !IsEntityAVehicle(veh) ||
    !NetworkGetEntityIsNetworked(veh) ||
    Util.getPlyCoords().distance(Util.getEntityCoords(veh)) > 2.0
  ) {
    Notifications.add('Geen voertuig om te wassen', 'error');
    return;
  }

  const [wasCanceled] = await Taskbar.create('spray-can-sparkles', 'Cleaning Vehicle', 10000, {
    canCancel: true,
    cancelOnDeath: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      combat: true,
      movement: true,
    },
    animation: {
      task: 'WORLD_HUMAN_MAID_CLEAN',
    },
  });
  if (wasCanceled) return;

  const removedItem = await Inventory.removeItemByNameFromPlayer('cleaning_kit');
  if (!removedItem) {
    Notifications.add('Je hebt geen schoonmaakset', 'error');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(veh);
  Events.emitNet('vehicles:carwash:clean', netId);
};

export const useWax = async () => {
  if (getCurrentVehicle()) {
    Notifications.add('Je kan dit niet van in een voertuig', 'error');
    return;
  }

  const { entity: veh } = RayCast.doRaycast();
  if (
    !veh ||
    !IsEntityAVehicle(veh) ||
    !NetworkGetEntityIsNetworked(veh) ||
    Util.getPlyCoords().distance(Util.getEntityCoords(veh)) > 2.0
  ) {
    Notifications.add('Geen voertuig om te waxen', 'error');
    return;
  }

  const [wasCanceled] = await Taskbar.create('spray-can-sparkles', 'Voertuig waxen', 30000, {
    canCancel: true,
    cancelOnDeath: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      combat: true,
      movement: true,
    },
    animation: {
      task: 'WORLD_HUMAN_MAID_CLEAN',
    },
  });
  if (wasCanceled) return;

  const removedItem = await Inventory.removeItemByNameFromPlayer('vehicle_wax');
  if (!removedItem) {
    Notifications.add('Je hebt geen voertuig wax', 'error');
    return;
  }

  Events.emitNet('vehicles:carwash:applyUsedWax', NetworkGetNetworkIdFromEntity(veh));
};
