import { Util } from '@dgx/server';
import { DGXEvent, EventListener } from '@dgx/server/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { HeistLocation } from './heistlocation';
import config from 'services/config';
import { FleecaManager } from './typemanagers/fleecamanager';

@EventListener()
class HeistManager extends Util.Singleton<HeistManager>() {
  private readonly logger: winston.Logger;
  private readonly locations: Map<Heists.LocationId, HeistLocation>;
  private readonly typeManagers: Partial<Record<Heists.HeistType, Heists.TypeManager>>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Manager' });
    this.locations = new Map();
    this.typeManagers = {
      fleeca: new FleecaManager(),
    };
  }

  private getLocation = (locationId: Heists.LocationId) => {
    const location = this.locations.get(locationId);
    if (!location) {
      const logMsg = `Tried to get invalid location by id ${locationId}`;
      this.logger.error(logMsg);
      Util.Log(
        'heists:unknownLocation',
        {
          locationId,
        },
        logMsg,
        undefined,
        true
      );
      return;
    }
    return location;
  };

  public getManagerForType = (heistType: Heists.HeistType) => {
    const manager = this.typeManagers[heistType];
    if (!manager) {
      const logMsg = `Tried to get manager for heisttype ${heistType} but was not registered`;
      this.logger.error(logMsg);
      Util.Log(
        'heists:unregisteredType',
        {
          heistType,
        },
        logMsg,
        undefined,
        true
      );
      return;
    }
    return manager;
  };

  public initialize = () => {
    // build locations
    for (const id of Object.keys(config.locations) as Heists.LocationId[]) {
      const location = new HeistLocation(id);
      this.locations.set(id, location);
    }

    // initialize type managers
    for (const typeManager of Object.values(this.typeManagers)) {
      typeManager.initialize();
    }
  };

  @DGXEvent('heists:location:enter')
  private _enterLocation = (plyId: number, locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    location.playerEntered(plyId);
  };

  @DGXEvent('heists:location:leave')
  private leaveLocation = (plyId: number, locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    location.playerLeft(plyId);
  };

  public getIdOfLocationPlayerIsIn = (plyId: number) => {
    for (const [id, location] of this.locations) {
      if (location.isPlayerInside(plyId)) {
        return id;
      }
    }
  };

  public leaveCurrentLocation = (plyId: number) => {
    const locationId = this.getIdOfLocationPlayerIsIn(plyId);
    if (!locationId) return;
    this.leaveLocation(plyId, locationId);
  };

  public getLocationDoorState = (locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return false;
    return location.getDoorState();
  };

  public setLocationDoorState = (locationId: Heists.LocationId, state: boolean) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    location.setDoorState(state);
  };

  public canHackLocation = (locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return false;
    if (location.isDone()) return false;

    const typeManager = this.getManagerForType(location.getHeistType());
    if (!typeManager) return false;
    return typeManager.canHack();
  };

  public startHackAtLocation = (locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    const typeManager = this.getManagerForType(location.getHeistType());
    if (!typeManager) return;
    typeManager.startedHack();
  };

  public finishHackAtLocation = (locationId: Heists.LocationId, success: boolean) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    const typeManager = this.getManagerForType(location.getHeistType());
    if (!typeManager) return;

    if (success) {
      location.setDone();
    }

    typeManager.finishedHack(success);
  };

  public getHeistTypeByLocationId = (locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    return location.getHeistType();
  };

  public getHeistTypeConfigByLocationId = (locationId: Heists.LocationId) => {
    const heistType = this.getHeistTypeByLocationId(locationId);
    if (!heistType) {
      this.logger.error(`Could not get heist type of locationId ${locationId}`);
      return;
    }

    const heistTypeConfig = config.types[heistType];
    if (!heistTypeConfig) {
      this.logger.error(`Could not get heist type config of type ${heistType}`);
      return;
    }

    return heistTypeConfig;
  };

  public getLocationIdsForHeistType = (heistType: Heists.HeistType) => {
    const locationIds: Heists.LocationId[] = [];
    for (const [id, loc] of Object.entries(config.locations)) {
      if (loc.type === heistType) {
        locationIds.push(id as Heists.LocationId);
      }
    }
    return locationIds;
  };

  public isServiceUsedAtLocation = (locationId: Heists.LocationId, service: Heists.Service) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    return location.isServiceUsed(service);
  };

  public spawnTrolleysAtLocation = (locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    location.spawnTrolleys();
  };
}

const heistManager = HeistManager.getInstance();
export default heistManager;
