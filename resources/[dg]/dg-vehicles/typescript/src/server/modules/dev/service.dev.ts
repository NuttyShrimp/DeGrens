import { Notifications, Util } from '@dgx/server';
import { getVinForVeh } from 'helpers/vehicle';
import { mainLogger } from 'sv_logger';

type Event = { message: string; timestamp: string };

export const startVehicleExistenceThread = (plyId: number) => {
  const vehicle = GetVehiclePedIsIn(plyId, false);
  if (!vehicle || !DoesEntityExist(vehicle)) {
    Notifications.add(plyId, 'You are not in a vehicle', 'error');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const vin = getVinForVeh(vehicle);
  let lastOwner = NetworkGetEntityOwner(vehicle);

  const logger = mainLogger.child({ module: `DEV ${vin}` });
  const events: Event[] = [];

  const insertEvent = (message: string, isError = false) => {
    const event = {
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    events.push(event);
    logger[isError ? 'error' : 'info'](`${event.message} | Timestamp: ${event.timestamp}`);
  };

  insertEvent(`Started existence thread for vehicle ${vehicle} | VIN: ${vin} | netId: ${netId} | owner: ${lastOwner}`);

  const thread = setInterval(() => {
    if (!DoesEntityExist(vehicle)) {
      clearInterval(thread);

      insertEvent('Vehicle has been deleted', true);
      Util.Log(
        'vehicles:existenceThreadResult',
        {
          events,
        },
        `Finished `,
        plyId,
        true
      );

      return;
    }

    const currentOwner = NetworkGetEntityOwner(vehicle);
    if (currentOwner !== lastOwner) {
      insertEvent(`${currentOwner} has taken ownership of vehicle `);
      lastOwner = currentOwner;
    }
  }, 100);
};
