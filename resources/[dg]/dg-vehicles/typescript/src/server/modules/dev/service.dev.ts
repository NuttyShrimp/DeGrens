import { EventListener, LocalEvent, Notifications, Util } from '@dgx/server';
import { getVinForVeh } from 'helpers/vehicle';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

type Event = {
  message: string;
  timestamp: string;
};

type SpawnedVehicleData = {
  vin: string;
  thread: NodeJS.Timer;
  owner: number;
};

@EventListener()
class DevModule {
  private readonly logger: winston.Logger;
  private readonly spawnedVehicles: Map<number, SpawnedVehicleData>;

  constructor() {
    this.logger = mainLogger.child({ module: 'Dev' });
    this.spawnedVehicles = new Map();

    setInterval(() => {}, 100);
  }

  public registerSpawnedVehicle = (vehicle: number, vin: string) => {
    const data = {
      vin,
      owner: NetworkGetEntityOwner(vehicle),
      thread: setInterval(() => {
        data.owner = NetworkGetEntityOwner(vehicle);
      }, 100),
    };
    this.spawnedVehicles.set(vehicle, data);
  };

  public unregisterSpawnedVehicle = (vehicle: number) => {
    const data = this.spawnedVehicles.get(vehicle);
    if (!data) return;

    clearInterval(data.thread);
    this.spawnedVehicles.delete(vehicle);
  };

  @LocalEvent('entityRemoved')
  private _handleEntityRemoval = (entity: number) => {
    if (!this.spawnedVehicles.has(entity)) return;

    const data = this.spawnedVehicles.get(entity)!;
    clearInterval(data.thread);
    this.spawnedVehicles.delete(entity);

    const logMsg = `Scriptspawned vehicle ${entity} (${data.vin}) has been deleted | Owner: ${data.owner}`;
    this.logger.warn(logMsg);
    Util.Log(
      'vehicles:dev:vehicleDeleted',
      {
        vin: data.vin,
        owner: data.owner,
      },
      logMsg,
      data.owner,
      true
    );
  };

  public startVehicleExistenceThread = (plyId: number) => {
    const ped = GetPlayerPed(String(plyId));
    const vehicle = GetVehiclePedIsIn(ped, false);
    if (!vehicle || !DoesEntityExist(vehicle)) {
      Notifications.add(plyId, 'You are not in a vehicle', 'error');
      return;
    }

    const netId = NetworkGetNetworkIdFromEntity(vehicle);
    const vin = getVinForVeh(vehicle);
    let lastOwner = NetworkGetEntityOwner(vehicle);

    const events: Event[] = [];

    const insertEvent = (message: string, isError = false) => {
      const event = {
        message,
        timestamp: new Date().toLocaleTimeString(),
      };
      events.push(event);
      this.logger[isError ? 'error' : 'info'](`${vin}: ${event.message} | Timestamp: ${event.timestamp}`);
    };

    insertEvent(
      `Started existence thread for vehicle ${vehicle} | VIN: ${vin} | netId: ${netId} | owner: ${lastOwner}`
    );

    const thread = setInterval(() => {
      if (!DoesEntityExist(vehicle)) {
        clearInterval(thread);

        insertEvent('Vehicle has been deleted', true);
        Util.Log(
          'vehicles:dev:existenceThreadResult',
          {
            events,
            vin,
          },
          `Finished ${vin} existence thread`,
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
}

const devModule = new DevModule();
export default devModule;
