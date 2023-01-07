import { Events, Notifications, Util } from '@dgx/server';
import { forceStopInteractions } from '../service.interactions';
import { getPlayerBeingEscorted } from './escort';
import { getPlayerBeingCarried } from './carry';

Events.onNet(
  'police:interactions:takeOutVehicle',
  (src: number, netId: number, amountOfSeats: number, closestSeat: number | undefined) => {
    const vehicle = NetworkGetEntityFromNetworkId(netId);
    if (!DoesEntityExist(vehicle)) return;

    const vehCoords = Util.getEntityCoords(vehicle);
    if (Util.getPlyCoords(src).distance(vehCoords) > 4) {
      Notifications.add(src, 'Je bent niet in de buurt van het voertuig', 'error');
      return;
    }

    let targetPed: number | null = null;

    // Check if a player in closest seat to origin player
    if (closestSeat !== undefined) {
      const pedInClosestSeat = GetPedInVehicleSeat(vehicle, closestSeat);
      if (pedInClosestSeat !== 0 && IsPedAPlayer(pedInClosestSeat)) {
        targetPed = pedInClosestSeat;
      }
    }

    // If none was found in closest seat then check all seats starting from back
    if (targetPed === null) {
      for (let i = amountOfSeats - 2; i >= -1; i--) {
        const pedInSeat = GetPedInVehicleSeat(vehicle, i);
        if (pedInSeat !== 0 && IsPedAPlayer(pedInSeat)) {
          targetPed = pedInSeat;
          break;
        }
      }
    }

    if (targetPed === null) {
      Notifications.add(src, 'Er zit niemand in het voertuig', 'error');
      return;
    }

    TaskLeaveVehicle(targetPed, vehicle, 16);
    // Without this cuff/down anim wont continue
    setTimeout(() => {
      ClearPedTasksImmediately(targetPed!);
    }, 250);

    const target = NetworkGetEntityOwner(targetPed);
    Util.Log(
      'police:interactions:takeOutVehicle',
      { netId, target },
      `${Util.getName(src)} has taken ${Util.getName(target)} out of a vehicle`,
      src
    );
  }
);

Events.onNet(
  'police:interactions:putInVehicle',
  async (src: number, netId: number, amountOfSeats: number, closestSeat: number | undefined) => {
    const vehicle = NetworkGetEntityFromNetworkId(netId);
    if (!DoesEntityExist(vehicle)) return;

    const vehCoords = Util.getEntityCoords(vehicle);
    if (Util.getPlyCoords(src).distance(vehCoords) > 4) {
      Notifications.add(src, 'Je bent niet in de buurt van het voertuig', 'error');
      return;
    }

    let target: number | undefined = undefined;

    // Prioritize the player you are escorting/carrying
    const escortedPlayer = getPlayerBeingEscorted(src);
    const carriedPlayer = getPlayerBeingCarried(src);
    if (escortedPlayer) {
      target = escortedPlayer;
    } else if (carriedPlayer) {
      target = carriedPlayer;
    } else {
      target = Util.getClosestPlayerOutsideVehicle(src);
    }

    if (!target) {
      Notifications.add(src, 'Er is niemand in de buurt', 'error');
      return;
    }

    let targetSeat: number | null = null;

    // Check if closest seat to origin player is free
    if (closestSeat !== undefined) {
      const pedInClosestSeat = GetPedInVehicleSeat(vehicle, closestSeat);
      if (pedInClosestSeat === 0) {
        targetSeat = closestSeat;
      }
    }

    // If closest wasnt free, check every other seat starting from back
    if (targetSeat === null) {
      for (let i = amountOfSeats - 2; i >= -1; i--) {
        const pedInSeat = GetPedInVehicleSeat(vehicle, i);
        if (pedInSeat === 0) {
          targetSeat = i;
          break;
        }
      }
    }

    if (targetSeat === null) {
      Notifications.add(src, 'Er is geen plaats in het voertuig', 'error');
      return;
    }

    await forceStopInteractions(target);

    TaskWarpPedIntoVehicle(GetPlayerPed(String(target)), vehicle, targetSeat);

    Util.Log(
      'police:interactions:putInVehicle',
      { netId, target },
      `${Util.getName(src)} has put ${Util.getName(target)} in a vehicle`,
      src
    );
  }
);
