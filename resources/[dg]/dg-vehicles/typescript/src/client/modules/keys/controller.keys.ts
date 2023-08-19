import { Events, Hospital, Keys, Peek, Police, Util } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';
import { setClassesWithoutLock, toggleVehicleLock } from './service.keys';
import { hasVehicleKeys } from './cache.keys';
import { LOCKPICK_TYPE_DATA } from './constants.keys';

Events.onNet(
  'vehicles:keys:startLockpick',
  async (lockpickType: Vehicles.LockpickType, id: string, minigameData?: any) => {
    const typeData = LOCKPICK_TYPE_DATA[lockpickType];

    const startData = typeData.start ? await typeData.start() : undefined;
    const success = await typeData.minigame(minigameData);
    if (typeData.end) await typeData.end(startData);

    Events.emitNet('vehicles:keys:finishLockPick', id, success);
  }
);

Keys.onPressDown('vehicle-lock', () => {
  if (Police.isCuffed() || Hospital.isDown()) return;
  toggleVehicleLock();
});

Keys.register('vehicle-lock', '(vehicle) toggle auto slot', 'L');

on('vehicles:keys:share', () => {
  const veh = getCurrentVehicle();
  if (!veh) return;
  const numSeats = GetVehicleModelNumberOfSeats(GetEntityModel(veh));
  Events.emitNet('vehicles:keys:shareToPassengers', NetworkGetNetworkIdFromEntity(veh), numSeats);
});

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Geef Sleutels',
      icon: 'fas fa-key',
      action: (_, entity) => {
        if (!entity) return;
        const numSeats = GetVehicleModelNumberOfSeats(GetEntityModel(entity));
        Events.emitNet('vehicles:keys:shareToClosest', NetworkGetNetworkIdFromEntity(entity), numSeats);
      },
      canInteract: ent => {
        if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
        if (!hasVehicleKeys(ent)) return false;
        if (IsPedInAnyVehicle(PlayerPedId(), false)) return false;
        // Option enabled if someone in driverseat, passenger seats or close and outside vehicle
        return (
          !IsVehicleSeatFree(ent, -1) ||
          GetVehicleNumberOfPassengers(ent) > 0 ||
          Util.isAnyPlayerClose({ range: 2, skipInVehicle: true })
        );
      },
    },
  ],
  distance: 2,
});

Events.onNet('vehicles:keys:setClassesWithoutLock', (classes: number[]) => {
  setClassesWithoutLock(classes);
});
