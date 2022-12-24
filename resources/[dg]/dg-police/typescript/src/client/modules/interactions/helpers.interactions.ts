import { Util } from '@dgx/client';

export const isAnyPlayerInVehicle = (vehicle: number) => {
  const amountOfSeats = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle));

  for (let seat = -1; seat < amountOfSeats - 1; seat++) {
    const ped = GetPedInVehicleSeat(vehicle, seat);
    if (ped && DoesEntityExist(ped) && IsPedAPlayer(ped)) {
      return true;
    }
  }

  return false;
};

export const getClosestSeatId = (vehicle: number) => {
  const plyCoords = Util.getPlyCoords();

  let closestDistance = 2.0;
  let closestSeat: number | undefined = undefined;

  for (let i = 0; i < 4; i++) {
    if (!GetIsDoorValid(vehicle, i)) continue;
    const [x, y, z] = GetEntryPositionOfDoor(vehicle, i);
    const distance = plyCoords.distance({ x, y, z });
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSeat = i - 1;
    }
  }

  return closestSeat;
};
