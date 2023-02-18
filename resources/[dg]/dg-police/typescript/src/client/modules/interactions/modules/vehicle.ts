import { Taskbar, Events, Peek, Util, Notifications } from '@dgx/client';
import { isAnyPlayerInVehicle, getClosestSeatId } from '../helpers.interactions';

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Haal uit voertuig',
      icon: 'fas fa-right-from-bracket',
      action: (_, vehicle) => {
        if (!vehicle) return;
        takeOutVehicle(vehicle);
      },
      canInteract: vehicle => {
        if (!vehicle || !NetworkGetEntityIsNetworked(vehicle)) return false;
        if (IsPedInAnyVehicle(PlayerPedId(), true)) return false;
        return isAnyPlayerInVehicle(vehicle);
      },
    },
    {
      label: 'Steek in voertuig',
      icon: 'fas fa-right-to-bracket',
      action: (_, vehicle) => {
        if (!vehicle) return;
        putInVehicle(vehicle);
      },
      canInteract: vehicle => {
        if (!vehicle || !NetworkGetEntityIsNetworked(vehicle)) return false;
        if (IsPedInAnyVehicle(PlayerPedId(), true)) return false;
        if (!AreAnyVehicleSeatsFree(vehicle)) return false;
        return Util.isAnyPlayerCloseAndOutsideVehicle();
      },
    },
  ],
  distance: 2,
});

const takeOutVehicle = async (vehicle: number) => {
  if (GetVehicleDoorLockStatus(vehicle) === 2) {
    Notifications.add('Het voertuig staat op slot', 'error');
    return;
  }

  // Get distance at start of taskbar to check if vehicle didnt move at end of taskbar
  const distanceAtStart = Util.getPlyCoords().distance(Util.getEntityCoords(vehicle));

  const [canceled] = await Taskbar.create('right-from-bracket', 'Uithalen', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    disableInventory: true,
    disarm: true,
    controlDisables: {
      combat: true,
      movement: true,
      carMovement: true,
    },
  });
  if (canceled) return;

  const distanceAtEnd = Util.getPlyCoords().distance(Util.getEntityCoords(vehicle));
  if (distanceAtEnd > distanceAtStart + 5) {
    Notifications.add('Je bent niet meer bij het voertuig');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const amountOfSeats = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle));
  const closestSeat = getClosestSeatId(vehicle);
  Events.emitNet('police:interactions:takeOutVehicle', netId, amountOfSeats, closestSeat);
};

const putInVehicle = async (vehicle: number) => {
  if (GetVehicleDoorLockStatus(vehicle) === 2) {
    Notifications.add('Het voertuig staat op slot', 'error');
    return;
  }

  // Get distance at start of taskbar to check if vehicle didnt move at end of taskbar
  const distanceAtStart = Util.getPlyCoords().distance(Util.getEntityCoords(vehicle));

  const [canceled] = await Taskbar.create('right-to-bracket', 'Insteken', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    disableInventory: true,
    disarm: true,
    controlDisables: {
      combat: true,
      movement: true,
      carMovement: true,
    },
  });
  if (canceled) return;

  const distanceAtEnd = Util.getPlyCoords().distance(Util.getEntityCoords(vehicle));
  if (distanceAtEnd > distanceAtStart + 5) {
    Notifications.add('Je bent niet meer bij het voertuig');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const amountOfSeats = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle));
  let closestSeat = getClosestSeatId(vehicle);
  // if motorcycle, force backseat
  if (GetVehicleClass(vehicle) === 8) {
    closestSeat = Math.max(-1, amountOfSeats - 2);
  }
  Events.emitNet('police:interactions:putInVehicle', netId, amountOfSeats, closestSeat);
};
