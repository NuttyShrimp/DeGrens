import { Events, Notifications, Util, Vehicles } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';
import { isSeatbeltOn } from 'modules/seatbelts/service.seatbelts';

let noShuffleThread: NodeJS.Timer | null = null;

export const moveToSeat = (vehicle: number, seatIndex: number) => {
  const numSeats = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle));
  if (seatIndex > numSeats - 2) {
    Notifications.add(`Er zijn maar ${numSeats} stoelen in dit voertuig`, 'error');
    return;
  }
  const ped = PlayerPedId();
  const pedInSeat = GetPedInVehicleSeat(vehicle, seatIndex);
  if (pedInSeat !== 0) {
    if (pedInSeat === ped) {
      Notifications.add(`Je zit al op deze stoel`, 'error');
      return;
    }
    Notifications.add(`Deze stoel is al bezet`, 'error');
    return;
  }
  if (isSeatbeltOn()) {
    Notifications.add(`Je hebt je gordel nog aan`, 'error');
    return;
  }
  if (Vehicles.getVehicleSpeed(vehicle) > 30) {
    Notifications.add(`Het voertuig gaat te snel`, 'error');
    return;
  }
  SetPedIntoVehicle(ped, vehicle, seatIndex);
};

Events.onNet('vehicles:seat:set', (seatIndex: number) => {
  const vehicle = getCurrentVehicle();
  if (!vehicle) {
    Notifications.add('Je zit niet in een voertuig', 'error');
    return;
  }
  moveToSeat(vehicle, seatIndex);
});

export const startNoShuffleThread = (vehicle: number) => {
  stopNoShuffleThread();
  noShuffleThread = setInterval(() => {
    const ped = PlayerPedId();
    if (!GetPedConfigFlag(ped, 184, true)) {
      SetPedConfigFlag(ped, 184, true);
    }
    if (GetIsTaskActive(ped, 165)) {
      let seat = 0;
      if (GetPedInVehicleSeat(vehicle, -1) === ped) {
        seat = -1;
      }
      SetPedIntoVehicle(ped, vehicle, seat);
      SetVehicleCloseDoorDeferedAction(vehicle, false);
    }
  });
};

export const stopNoShuffleThread = () => {
  if (noShuffleThread !== null) {
    clearInterval(noShuffleThread);
    noShuffleThread = null;
  }
};
