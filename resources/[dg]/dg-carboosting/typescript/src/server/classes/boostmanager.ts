import { mainLogger } from 'sv_logger';
import winston from 'winston';
import Boost from './boost';
import config, { getLocationsForClass } from 'helpers/config';
import { Jobs, Notifications, Util } from '@dgx/server';
import { DGXEvent, EventListener, LocalEvent } from '@dgx/server/src/decorators';

@EventListener()
class BoostManager {
  private readonly logger: winston.Logger;
  private nextBoostId: number;
  private boosts: Map<string, Boost>;

  // keep seperate map to avoid iteration in 'entityRemoved' event
  private vehicleToBoost: Map<number, string>;

  constructor() {
    this.logger = mainLogger.child({ module: 'BoostManager' });
    this.nextBoostId = 0;
    this.boosts = new Map();
    this.vehicleToBoost = new Map();
  }

  private getBoostByGroupId = (groupId: string) => {
    for (const [_, b] of this.boosts) {
      if (b.groupId !== groupId) continue;
      return b;
    }
  };

  private getBoostByOwnerCid = (cid: number) => {
    for (const [_, b] of this.boosts) {
      if (b.getOwnerCid() !== cid) continue;
      return b;
    }
  };

  public isPlayerInBoost = (cid: number) => {
    const group = Jobs.getGroupByCid(cid);
    if (!group) return false;
    return !!this.getBoostByGroupId(group.id);
  };

  private getBoostByVehicle = (vehicle: number, skipValidation = false) => {
    const boostId = this.vehicleToBoost.get(vehicle);
    if (!boostId) return;

    const boost = this.boosts.get(boostId);
    if (!boost) {
      this.logger.error(`Vehicle ${vehicle} has associated boost ${boostId} but boost does not exist`);
      return;
    }

    if (!skipValidation) {
      const validated = boost.validateVehicle(vehicle);
      if (!validated) return;
    }

    return boost;
  };

  public startBoost = (data: {
    plyId: number;
    cid: number;
    groupId: string;
    vehicleClass: Vehicles.Class;
    vehicleModel: string;
    type: Carboosting.DropoffType;
  }) => {
    const id = `boost_${++this.nextBoostId}`;
    const boost = new Boost(id, data.plyId, data.cid, data.groupId, data.vehicleClass, data.vehicleModel, data.type);
    this.boosts.set(id, boost);
    boost.start();
  };

  public unregisterBoost = (boostId: string) => {
    this.boosts.delete(boostId);
  };

  public registerBoostVehicle = (boostId: string, vehicle: number) => {
    this.vehicleToBoost.set(vehicle, boostId);
  };

  public unregisterBoostVehicle = (vehicle: number) => {
    this.vehicleToBoost.delete(vehicle);
  };

  @LocalEvent('entityRemoved')
  private _handleEntityRemoval = (entity: number) => {
    const boost = this.getBoostByVehicle(entity, true);
    if (!boost) return;
    boost.finish();
  };

  public getRandomVehicleLocationIdxForClass = (vehicleClass: Vehicles.Class) => {
    const locations = getLocationsForClass(vehicleClass);
    const idsToTry = Util.shuffleArray([...new Array(locations.length)].map((_, i) => i));
    const usedIdxs = [...this.boosts.values()].reduce<Set<number>>(
      (idxs, b) => idxs.add(b.vehicleLocationIdx),
      new Set()
    );

    if (idsToTry.length === 0) throw new Error('empty vehicle locations array');

    while (idsToTry.length > 0) {
      const id = idsToTry.pop();
      if (id === undefined || usedIdxs.has(id)) continue;
      return id;
    }

    throw new Error(`Could not find an unused location for class ${vehicleClass}`);
  };

  public getRandomDropoffLocationIdx = (type: Carboosting.DropoffType): number => {
    const locations = config.dropoffs[type];
    const idsToTry = Util.shuffleArray([...new Array(locations.length)].map((_, i) => i));
    const usedIdxs = [...this.boosts.values()].reduce<Set<number>>((idxs, b) => {
      if (b.dropoffLocationIdx !== null) {
        idxs.add(b.dropoffLocationIdx);
      }
      return idxs;
    }, new Set());

    if (idsToTry.length === 0) throw new Error('empty dropoff locations array');

    // we default to last one if all are somehow occupied as we dont have that many dropoff locations in config
    while (idsToTry.length > 1) {
      const id = idsToTry.pop();
      if (id === undefined || usedIdxs.has(id)) continue;
      return id;
    }

    return idsToTry[0];
  };

  public handlePlayerJoined = (plyId: number, cid: number) => {
    const group = Jobs.getGroupByCid(cid);
    if (!group) return;
    const boost = this.getBoostByGroupId(group.id);
    if (!boost) return;
    boost.handlePlayerJoined(plyId, cid);
  };

  public handlePlayerLeft = (plyId: number, cid: number) => {
    const boost = this.getBoostByOwnerCid(cid);
    if (!boost) return;
    boost.clearOwnerServerId();
  };

  public handlePlayerLeftGroup = (plyId: number | null, groupId: string) => {
    const boost = this.getBoostByGroupId(groupId);
    if (!boost) return;

    if (plyId) {
      boost.cleanupPlayer(plyId);
    }

    const group = Jobs.getGroupById(groupId);
    if (group && group.members.length > 0) return;

    boost.finish();
  };

  public handleVehicleLockpick = (plyId: number, vehicle: number) => {
    const boost = this.getBoostByVehicle(vehicle);
    if (!boost) return;
    boost.handleVehicleLockpick(plyId);
  };

  public handleTrackerDisablerUsage = (plyId: number, vehicle: number) => {
    const boost = this.getBoostByVehicle(vehicle);
    if (!boost || !boost.hasTracker()) {
      Notifications.add(plyId, 'Dit voertuig heeft geen tracker om uit te schakelen', 'error');
      return;
    }
    boost.disableTracker(plyId);
  };

  @DGXEvent('carboosting:boost:enteredVehicleZone')
  private _enteredVehicleZone = (plyId: number, boostId: string) => {
    const boost = this.boosts.get(boostId);
    if (!boost) return;
    boost.handleEnteredVehicleZone(plyId);
  };

  @DGXEvent('carboosting:boost:dropoff')
  private _dropoffVehicle = (plyId: number, netId: number, healthPercentage: number) => {
    const vehicle = NetworkGetEntityFromNetworkId(netId);
    if (!vehicle || !DoesEntityExist(vehicle)) return;
    const boost = this.getBoostByVehicle(vehicle);
    if (!boost) return;
    boost.dropoff(plyId, healthPercentage);
  };

  public finishAllBoosts = () => {
    this.boosts.forEach(b => b.finish());
  };
}

const boostManager = new BoostManager();
export default boostManager;
