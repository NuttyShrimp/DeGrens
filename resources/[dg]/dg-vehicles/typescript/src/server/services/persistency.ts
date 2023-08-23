import { Chat, DGXEvent, Sync } from '@dgx/server';
import { getVinForVeh, spawnOwnedVehicle, spawnVehicle } from 'helpers/vehicle';

import { EventListener, LocalEvent, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import vinManager from 'modules/identification/classes/vinmanager';
import { getPlayerVehicleInfo } from 'db/repository';
import { fuelManager } from 'modules/fuel/classes/fuelManager';
import { getVehicleDoorsLocked } from 'modules/keys/service.keys';

type SpawnedVehicleData = {
  vehicleData: {
    vin: string;
    plate: string;
    model: string;
  };
  loggingThread: NodeJS.Timer;
  owner: number;
  events: Event[];
};

type Event = {
  message: string;
  timestamp: string;
};

type RestoreData = {
  coords: Vec4;
  engine: boolean;
  fuel: number;
  locked: boolean;
};

@EventListener()
class PersistencyModule {
  private readonly logger: winston.Logger;
  private readonly spawnedVehicles: Map<number, SpawnedVehicleData>;

  constructor() {
    this.logger = mainLogger.child({ module: 'Persistency' });
    this.spawnedVehicles = new Map();
  }

  private getDate = () => {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
  };

  private getVehicleRestoreData = (vehicle: number): RestoreData => {
    return {
      coords: { ...Util.getEntityCoords(vehicle), w: GetEntityHeading(vehicle) },
      engine: GetIsVehicleEngineRunning(vehicle),
      fuel: fuelManager.getFuelLevel(vehicle),
      locked: getVehicleDoorsLocked(vehicle),
    };
  };

  public registerSpawnedVehicle = ({
    vehicle,
    ...vehicleData
  }: {
    vehicle: number;
  } & SpawnedVehicleData['vehicleData']) => {
    this.startMissionEntityThread(vehicle);

    const data: SpawnedVehicleData = {
      vehicleData,
      owner: -1,
      events: [
        {
          message: `Vehicle has been created`,
          timestamp: this.getDate(),
        },
      ],
      // Ownership transfer logging to debug the actual cause of this shit
      loggingThread: setInterval(() => {
        try {
          const owner = NetworkGetEntityOwner(vehicle);
          if (data.owner === owner) return;
          data.events.push({
            message: `${owner} took ownership from ${data.owner}`,
            timestamp: this.getDate(),
          });
          data.owner = owner;
        } catch (e: unknown) {
          this.logger.error(e);
          this.handleEntityRemoval(vehicle);
        }
      }, 100),
    };
    this.spawnedVehicles.set(vehicle, data);
  };

  public unregisterSpawnedVehicle = (vehicle: number) => {
    const data = this.spawnedVehicles.get(vehicle);
    if (!data) return;

    clearInterval(data.loggingThread);
    this.spawnedVehicles.delete(vehicle);
  };

  @LocalEvent('entityRemoved')
  private handleEntityRemoval = (vehicle: number) => {
    if (!this.spawnedVehicles.has(vehicle)) return;

    const data = this.spawnedVehicles.get(vehicle)!;
    clearInterval(data.loggingThread);
    this.spawnedVehicles.delete(vehicle);

    // i let this run for 10 minutes and every single time the entity still exists when this event is called
    // we can use that to determine restore data instead of needing to run it in a thread
    if (DoesEntityExist(vehicle)) {
      const restoreData = this.getVehicleRestoreData(vehicle);
      Util.awaitCondition(() => !DoesEntityExist(vehicle)).then(success => {
        if (!success) {
          this.logger.error(`Entity ${vehicle} kept existing after entityRemoved event was called`);
          return;
        }
        this.restoreVehicle(data.vehicleData, restoreData);
      });
    } else {
      this.logger.error(`Vehicle ${vehicle} did not exist anymore in entityRemoved event`);
    }

    // this logging is kept in place to actually debug this shit
    data.events.push({
      message: `Vehicle has been deleted`,
      timestamp: this.getDate(),
    });

    const logMsg = `Scriptspawned vehicle ${vehicle} (${data.vehicleData.vin}) has been deleted | Last Owner: ${data.owner}`;
    this.logger.warn(logMsg);
    Util.Log(
      'vehicles:persistency:vehicleDeleted',
      {
        vin: data.vehicleData.vin,
        events: data.events,
      },
      logMsg,
      data.owner
    );
  };

  // Only thing this bitch doesnt realistically sync, is upgrades of non owned vehicles and native damage
  // i could theoretically include it, but might be too performance heavy because it involves RPC calls in the restoreThread
  private restoreVehicle = async (vehicleData: SpawnedVehicleData['vehicleData'], restoreData: RestoreData) => {
    let promise: Promise<unknown | undefined>;
    if (vinManager.isVinFromPlayerVeh(vehicleData.vin)) {
      const vehicleInfo = await getPlayerVehicleInfo(vehicleData.vin);
      if (!vehicleInfo) {
        this.logger.error(`${vehicleData.vin} was registered as player owned but failed to get vehicle info`);
        return;
      }
      vehicleInfo.status.fuel = restoreData.fuel;
      promise = spawnOwnedVehicle(undefined, vehicleInfo, restoreData.coords, restoreData.engine, restoreData.locked);
    } else {
      promise = spawnVehicle({
        model: vehicleData.model,
        position: restoreData.coords,
        vin: vehicleData.vin,
        plate: vehicleData.plate,
        engineState: restoreData.engine,
        fuel: restoreData.fuel,
        doorsLocked: restoreData.locked,
      });
    }

    const result = await promise;
    if (result !== undefined) return;

    this.logger.error(`Failed to spawn restore vehicle ${vehicleData.vin}`);
  };

  private startMissionEntityThread = (vehicle: number) => {
    // we send vin, netId and serverise handle to client, they send it back when transfering thread to another owner
    // using those values, we can safely assume that entity is still same entity (as netIds WILL be reused)
    const vin = getVinForVeh(vehicle);
    const netId = NetworkGetNetworkIdFromEntity(vehicle);
    Sync.executeAction('vehicles:persistency:startMissionEntityThread', vehicle, {
      vin,
      netId,
      vehicle,
    });
  };

  @DGXEvent('vehicles:persistency:transferMissionEntityThread')
  private _transferMissionEntityThread = (_: number, data: { vin: string; netId: number; vehicle: number }) => {
    const vehicle = NetworkGetEntityFromNetworkId(data.netId);
    if (!vehicle || !DoesEntityExist(vehicle)) return;

    // entity handle should always stay same, we receive original handle from client to check if netId still corresponds to original vehicle
    if (vehicle !== data.vehicle) return;

    // we check if vehicle still has same vin as it had when thread was started
    const vin = getVinForVeh(vehicle);
    if (vin !== data.vin) return;

    Sync.executeAction('vehicles:persistency:startMissionEntityThread', vehicle, data);
  };
}

const persistencyModule = new PersistencyModule();
export default persistencyModule;
