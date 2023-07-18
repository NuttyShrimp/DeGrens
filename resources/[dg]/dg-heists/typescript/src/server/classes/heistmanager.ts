import { Util, Jobs } from '@dgx/server';
import { DGXEvent, EventListener } from '@dgx/server/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { HeistLocation } from './heistlocation';
import config from 'services/config';
import { FleecaManager } from './typemanagers/fleecamanager';
import { PaletoManager } from './typemanagers/paletomanager';
import { JewelryManager } from './typemanagers/jewelrymanager';

@EventListener()
class HeistManager extends Util.Singleton<HeistManager>() {
  private readonly logger: winston.Logger;
  private readonly locations: Map<Heists.LocationId, HeistLocation>;
  private readonly typeManagers: Record<Heists.HeistType, Heists.TypeManager>;

  private readonly onEnterHandlers: ((locationId: string, plyId: number) => void)[];
  private readonly onLeaveHandlers: ((locationId: string, plyId: number) => void)[];

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Manager' });
    this.locations = new Map();
    this.typeManagers = {
      fleeca: new FleecaManager(),
      paleto: new PaletoManager(),
      jewelry: new JewelryManager(),
    };

    this.onEnterHandlers = [];
    this.onLeaveHandlers = [];
  }

  private getLocation = (locationId: Heists.LocationId, supressError = false) => {
    const location = this.locations.get(locationId);
    if (!location) {
      if (!supressError) {
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
    }
    return location;
  };

  public getManagerForType = <T extends Heists.TypeManager = Heists.TypeManager>(heistType: Heists.HeistType): T => {
    const manager = this.typeManagers[heistType];
    if (!manager) {
      const logMsg = `Tried to get manager for heisttype ${heistType} but was not registered`;
      Util.Log(
        'heists:unregisteredType',
        {
          heistType,
        },
        logMsg,
        undefined,
        true
      );
      throw new Error(logMsg);
    }
    return manager as T;
  };

  public initialize = () => {
    // build locations
    for (const id of Object.keys(config.locations) as Heists.LocationId[]) {
      if (!this.typeManagers[config.locations[id].type]) {
        this.logger.silly(`Skipping location ${id} because it has an invalid type`);
        continue;
      }
      const location = new HeistLocation(id);
      this.locations.set(id, location);
    }

    // initialize type managers
    for (const typeManager of Object.values(this.typeManagers)) {
      typeManager.initialize?.();
    }
  };

  @DGXEvent('heists:location:enter')
  private _enterLocation = (plyId: number, locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId, true);
    if (!location) return;
    location.playerEntered(plyId);
    this.onEnterHandlers.forEach(cb => cb(locationId, plyId));
  };

  @DGXEvent('heists:location:leave')
  private leaveLocation = (plyId: number, locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId, true);
    if (!location) return;
    location.playerLeft(plyId);
    this.onLeaveHandlers.forEach(cb => cb(locationId, plyId));
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
    return typeManager.canHack?.() ?? true;
  };

  public startHackAtLocation = (locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    const typeManager = this.getManagerForType(location.getHeistType());
    typeManager.startedHack?.();
  };

  public finishHackAtLocation = (locationId: Heists.LocationId, success: boolean) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    const typeManager = this.getManagerForType(location.getHeistType());

    if (success) {
      location.setDone();
    }

    typeManager.finishedHack?.(success);
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

  public isLocationDone = (locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return;
    return location.isDone();
  };

  @DGXEvent('heists:location:resetDoor')
  private _resetLocationDoor = (plyId: number, locationId: Heists.LocationId) => {
    if (Jobs.getCurrentJob(plyId) !== 'police') return;

    this.setLocationDoorState(locationId, false);

    const logMsg = `${Util.getName(plyId)}(${plyId}) has reset the door of location ${locationId}`;
    this.logger.silly(logMsg);
    Util.Log('heists:resetDoor', { locationId }, logMsg, plyId);
  };

  public getPlayersAtLocation = (locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return [];
    return location.getPlayersInside();
  };

  public getAmountOfPlayersInLocation = (locationId: Heists.LocationId) => {
    const location = this.getLocation(locationId);
    if (!location) return 0;
    return location.getAmountOfPlayersInside();
  };

  /**
   * Do not use this function inside a typemanagers constructor (those get called before heistmanager constructor is finished)
   * Instead use in initialize funciton of typemanager
   */
  public onLocationEnter = (cb: (typeof this.onEnterHandlers)[number]) => {
    this.onEnterHandlers.push(cb);
  };

  /**
   * Do not use this function inside a typemanagers constructor (those get called before heistmanager constructor is finished)
   * Instead use in initialize funciton of typemanager
   */
  public onLocationLeave = (cb: (typeof this.onLeaveHandlers)[number]) => {
    this.onLeaveHandlers.push(cb);
  };
}

const heistManager = HeistManager.getInstance();
export default heistManager;
