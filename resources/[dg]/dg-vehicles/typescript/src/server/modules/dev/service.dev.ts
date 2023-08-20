import { EventListener, LocalEvent, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

type SpawnedVehicleData = {
  vin: string;
  thread: NodeJS.Timer;
  owner: number;
  events: Event[];
};

type Event = {
  message: string;
  timestamp: string;
};

@EventListener()
class DevModule {
  private readonly logger: winston.Logger;
  private readonly spawnedVehicles: Map<number, SpawnedVehicleData>;

  constructor() {
    this.logger = mainLogger.child({ module: 'Dev' });
    this.spawnedVehicles = new Map();
  }

  private getDate = () => {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
  };

  public registerSpawnedVehicle = (vehicle: number, vin: string) => {
    const data: SpawnedVehicleData = {
      vin,
      owner: -1,
      events: [
        {
          message: `Vehicle has been created`,
          timestamp: this.getDate(),
        },
      ],
      thread: setInterval(() => {
        const owner = NetworkGetEntityOwner(vehicle);
        if (data.owner === owner) return;
        data.events.push({
          message: `${owner} took ownership from ${data.owner}`,
          timestamp: this.getDate(),
        });
        data.owner = owner;
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

    data.events.push({
      message: `Vehicle has been deleted`,
      timestamp: this.getDate(),
    });

    const logMsg = `Scriptspawned vehicle ${entity} (${data.vin}) has been deleted | Last Owner: ${data.owner}`;
    this.logger.warn(logMsg);
    Util.Log(
      'vehicles:dev:vehicleDeleted',
      {
        vin: data.vin,
        events: data.events,
      },
      logMsg,
      data.owner,
      true
    );
  };
}

const devModule = new DevModule();
export default devModule;
