import { Events, RPC } from './index';
import { Util as UtilShared } from '../../shared/classes/util';
import { MATERIAL_HASH_ENUM, MOVEMENT_CLIPSET_ENUM } from '../constants';

class Util extends UtilShared {
  private prodEnv!: boolean;

  constructor() {
    super();
    onNet('dgx:isProduction', (isProd: boolean) => {
      this.prodEnv = isProd;
    });
    emitNet('dgx:requestEnv');
  }

  getPlyCoords() {
    const plyPed = PlayerPedId();
    const plyCoords = GetEntityCoords(plyPed, true);
    return this.ArrayToVector3(plyCoords);
  }

  getEntityCoords(entity: number) {
    const entityCoords = GetEntityCoords(entity, true);
    return this.ArrayToVector3(entityCoords);
  }

  getEntityRotation(entity: number) {
    const entityRotation = GetEntityRotation(entity, 0);
    return this.ArrayToVector3(entityRotation);
  }

  getEntityVelocity(entity: number) {
    const entityVelocity = GetEntityVelocity(entity);
    return this.ArrayToVector3(entityVelocity);
  }

  getBoneDistance(entity: number, boneId: string | number) {
    const entityType = GetEntityType(entity);
    if (!entityType) {
      throw new Error('Invalid Entity to calculate bone distance');
    }
    const bone =
      entityType === 1 ? GetPedBoneIndex(entity, Number(boneId)) : GetEntityBoneIndexByName(entity, String(boneId));
    const boneCoords = this.ArrayToVector3(GetWorldPositionOfEntityBone(entity, bone));
    return boneCoords.distance(this.getPlyCoords());
  }

  loadModel = (model: string | number) => {
    RequestModel(model);
    return this.awaitCondition(() => HasModelLoaded(model));
  };

  loadAnimDict = (dict: string) => {
    RequestAnimDict(dict);
    return this.awaitCondition(() => HasAnimDictLoaded(dict));
  };

  requestEntityControl = (entity: number) => {
    NetworkRequestControlOfEntity(entity);
    return this.awaitCondition(() => NetworkHasControlOfEntity(entity));
  };

  isDevEnv() {
    return this.prodEnv !== undefined && this.prodEnv === false;
  }

  loadAnimSet = (set: string) => {
    RequestAnimSet(set);
    return this.awaitCondition(() => HasAnimSetLoaded(set));
  };

  getVehicleVin = (vehicle?: number): Promise<string | null> => {
    return global.exports['dg-vehicles'].getVehicleVin(vehicle);
  };

  getVehicleVinWithoutValidation = (vehicle?: number): string | null => {
    return global.exports['dg-vehicles'].getVehicleVinWithoutValidation(vehicle);
  };

  getVehicleSpeed = (veh: number) => {
    return Math.ceil(GetEntitySpeed(veh) * 3.6);
  };

  /**
   * Spawns ped that will attack all players
   */
  spawnAggressivePed = async (model: string, position: Vec4) => {
    const pedModel = GetHashKey(model);
    const { entity: ped } = await this.createPedOnServer(model, position);
    if (!ped) return;
    SetPedRelationshipGroupHash(ped, GetHashKey('ATTACK_ALL_PLAYERS'));
    SetPedDropsWeaponsWhenDead(ped, false);
    StopPedWeaponFiringWhenDropped(ped);
    RemoveAllPedWeapons(ped, false);
    SetPedCombatAbility(ped, 2);
    SetPedCombatAttributes(ped, 46, true);
    SetPedCombatAttributes(ped, 5, true);
    SetPedCombatMovement(ped, 2);
    SetPedCombatRange(ped, 2);
    SetModelAsNoLongerNeeded(pedModel);
    return ped;
  };

  goToCoords = async (position: Vec4, timeout = 5000, targetPed?: number) => {
    let ped = PlayerPedId();
    if (targetPed) {
      ped = targetPed;
    }
    const timeoutTime = GetGameTimer() + timeout;
    TaskGoStraightToCoord(ped, position.x, position.y, position.z, 1.0, timeout, position.w, 0.1);
    await this.awaitCondition(() => {
      return GetGameTimer() > timeoutTime || GetScriptTaskStatus(ped, 0x7d8f4411) == 7;
    }, timeout);
    if (GetGameTimer() > timeoutTime) {
      TaskPedSlideToCoord(ped, position.x, position.y, position.z, position.w, 1000);
      await this.Delay(1000);
    }
  };

  /**
   * @returns playerId (not serverId)
   */
  getFirstPlayerInDistanceAndOutsideVehicle = (distance: number) => {
    const players: number[] = GetActivePlayers();
    const ownPed = PlayerPedId();
    const ownCoords = this.getPlyCoords();

    for (const plyId of players) {
      const ped = GetPlayerPed(plyId);
      if (ped === ownPed) continue;
      if (IsPedInAnyVehicle(ped, true)) continue;

      const maxDistance = IsPedRagdoll(ped) ? distance + 0.5 : distance;
      const [x, y, z] = GetEntityCoords(ped, false);
      if (ownCoords.distance({ x, y, z }) < maxDistance) {
        return plyId;
      }
    }
  };

  isAnyPlayerCloseAndOutsideVehicle = (maxDistance = 2) => {
    return this.getFirstPlayerInDistanceAndOutsideVehicle(maxDistance) != undefined;
  };

  /**
   * @returns playerId (not serverId)
   */
  getClosestPlayerInDistanceAndOutsideVehicle = (distance = 999999) => {
    const players: number[] = GetActivePlayers();
    const ownPed = PlayerPedId();
    const ownCoords = this.getPlyCoords();

    let closestDistance = distance;
    let closestPly: number | undefined = undefined;

    for (const plyId of players) {
      const ped = GetPlayerPed(plyId);
      if (ped === ownPed) continue;
      if (IsPedInAnyVehicle(ped, true)) continue;

      const [x, y, z] = GetEntityCoords(ped, false);
      let distance = ownCoords.distance({ x, y, z });
      distance = IsPedRagdoll(ped) ? Math.max(0, distance - 0.5) : distance;
      if (distance > closestDistance) continue;

      closestDistance = distance;
      closestPly = plyId;
    }

    return closestPly;
  };

  getDistanceToClosestPlayerOutsideVehicle = () => {
    const maxDistance = 999999;
    const closestPly = this.getClosestPlayerInDistanceAndOutsideVehicle(maxDistance);
    if (!closestPly) return maxDistance;

    const ped = GetPlayerPed(closestPly);
    const coords = this.getEntityCoords(ped);
    return this.getPlyCoords().distance(coords);
  };

  private createEntityOnServer = async (
    entityType: 'object' | 'ped',
    model: string | number,
    coords: Vec3 | Vec4,
    routingBucket?: number,
    stateBags?: Record<string, any>
  ): Promise<{ netId: number | null; entity: number | null }> => {
    const netId = await RPC.execute<number>('dgx:createEntity', entityType, model, coords, routingBucket, stateBags);
    if (!netId) return { netId: null, entity: null };
    const exists = await this.awaitEntityExistence(netId, true);
    if (!exists) return { netId: null, entity: null };
    const entity = NetworkGetEntityFromNetworkId(netId);
    await this.requestEntityControl(entity);
    return { netId, entity };
  };

  createObjectOnServer = (
    model: string | number,
    coords: Vec3,
    routingBucket?: number,
    stateBags?: Record<string, any>
  ) => {
    return this.createEntityOnServer('object', model, coords, routingBucket, stateBags);
  };

  createPedOnServer = async (
    model: string | number,
    coords: Vec3 | Vec4,
    routingBucket?: number,
    stateBags?: Record<string, any>
  ) => {
    return this.createEntityOnServer('ped', model, coords, routingBucket, stateBags);
  };

  deleteEntity = (entity: number) => {
    if (!entity || !DoesEntityExist(entity) || !NetworkGetEntityIsNetworked(entity)) return;
    const netId = NetworkGetNetworkIdFromEntity(entity);
    if (!netId || !NetworkDoesNetworkIdExist(netId)) return;
    Events.emitNet('dgx:deleteEntity', netId);
  };

  getClosestNpcInRange = (range: number, pedsToIgnore: number[] = []): number | undefined => {
    const plyCoords = this.getPlyCoords();
    const peds: number[] = GetGamePool('CPed');

    let closestPed: number | undefined = undefined;
    let closestDistance = range;

    for (const ped of peds) {
      if (IsPedAPlayer(ped)) continue;
      if (pedsToIgnore.includes(ped)) continue;
      const distance = plyCoords.distance(this.getEntityCoords(ped));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPed = ped;
      }
    }

    return closestPed;
  };

  debug(msg: string) {
    if (!this.isDevEnv()) return;
    console.log(`[${GetCurrentResourceName()}] ${msg}`);
  }

  getServerIdForPed(ped: number) {
    const owner = NetworkGetEntityOwner(ped);
    return ped === GetPlayerPed(owner) ? GetPlayerServerId(owner) : 0;
  }

  getSeatPedIsIn = (vehicle: number, ped?: number) => {
    if (!ped) {
      ped = PlayerPedId();
    }
    const model = GetEntityModel(vehicle);
    const numSeats = GetVehicleModelNumberOfSeats(model);
    let seat = -1;
    for (let i = -1; i < numSeats - 1; i++) {
      if (GetPedInVehicleSeat(vehicle, i) !== ped) continue;
      seat = i;
      break;
    }
    return seat;
  };

  getCurrentVehicleInfo = () => {
    const ped = PlayerPedId();
    const vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle === 0 || !DoesEntityExist(vehicle)) return;
    const seat = this.getSeatPedIsIn(vehicle, ped);
    return {
      vehicle,
      seat,
      class: GetVehicleClass(vehicle),
    };
  };

  getPedMovementClipset = (ped: number): string | undefined => {
    //@ts-ignore
    const clipsetHash = GetPedMovementClipset(ped);
    return MOVEMENT_CLIPSET_ENUM[clipsetHash];
  };

  setWalkstyle = (walkstyle: string, save = true) => {
    global.exports['dg-misc'].setWalkstyle(walkstyle, save);
  };

  /**
   * Wrapper for scenarios to regain equipped weapon when scenario stops
   * This is needed to prevent anticheat bans for mismatching weapons
   */
  public startScenarioInPlace = (scenario: string) => {
    const ped = PlayerPedId();
    const startWeapon = GetSelectedPedWeapon(ped);

    TaskStartScenarioInPlace(ped, scenario, 0, true);

    let scenarioStarted = false;
    const thread = setInterval(() => {
      const isUsingScenario = IsPedUsingScenario(ped, scenario);
      if (isUsingScenario && !scenarioStarted) {
        scenarioStarted = true;
        return;
      }

      if (scenarioStarted && !isUsingScenario) {
        SetCurrentPedWeapon(ped, startWeapon, true);
        clearInterval(thread);
      }
    }, 1);
  };

  public isAtBackOfEntity = (entity: number, distance = 2) => {
    const model = GetEntityModel(entity);
    const [min, max] = GetModelDimensions(model);
    const yOffset = (max[1] - min[1]) / -2;
    const zOffset = (max[2] - min[2]) / 2;
    const coords = this.ArrayToVector3(GetOffsetFromEntityInWorldCoords(entity, 0, yOffset, zOffset));
    return this.getPlyCoords().distance(coords) < distance;
  };

  public setWaypoint = (coords: Vec2) => {
    DeleteWaypoint();
    ClearGpsPlayerWaypoint();
    SetNewWaypoint(coords.x, coords.y);
  };

  public getHeadingToFaceEntity = (entity: number) => {
    const entityCoords = this.getEntityCoords(entity);
    return this.getHeadingToFaceCoords(entityCoords);
  };

  public getHeadingToFaceCoords = (coords: Vec3) => {
    const pedCoords = this.getPlyCoords();
    const vector = { x: pedCoords.x - coords.x, y: pedCoords.y - coords.y };
    let heading = Math.atan(vector.y / vector.x);
    heading = (heading * 180) / Math.PI;
    heading = heading + 90;
    if (vector.x < 0) {
      heading = Math.abs(heading) + 180;
    }
    return heading;
  };

  public onPlayerLoaded = (handler: (playerData: PlayerData) => void) => {
    onNet('DGCore:client:playerLoaded', handler);
  };

  public onPlayerUnloaded = (handler: (cid: number) => void) => {
    onNet('DGCore:client:playerUnloaded', handler);
  };

  public getPreferences = (): Record<string, any> => {
    return global.exports['dg-misc'].getPreferences();
  };

  public onPreferenceChange = (handler: (preferences: Record<string, any>) => void) => {
    on('dg-misc:configChanged', handler);
  };

  public getGroundMaterial = (coords?: Vec3, ignoreEntity?: number) => {
    if (!coords) {
      coords = this.getPlyCoords();
    }
    if (!ignoreEntity) {
      ignoreEntity = PlayerPedId();
    }

    const handle = StartShapeTestCapsule(
      coords.x,
      coords.y,
      coords.z + 4,
      coords.x,
      coords.y,
      coords.z - 2,
      0.5,
      1,
      ignoreEntity,
      7
    );
    const materialHash = GetShapeTestResultIncludingMaterial(handle)[4] >>> 0; // fourth is material
    return MATERIAL_HASH_ENUM[materialHash];
  };

  public awaitEntityExistence = (entity: number, isNetId = false): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;

        // entity is netid here
        if (isNetId) {
          if (!NetworkDoesNetworkIdExist(entity)) return;
          if (!NetworkDoesEntityExistWithNetworkId(entity)) return;
        }

        const ent = isNetId ? NetworkGetEntityFromNetworkId(entity) : entity;
        if (attempts > 50) {
          clearInterval(interval);
          resolve(false);
        }
        if (DoesEntityExist(ent)) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });
  };

  public average = (arr: number[]) => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };
}

export class Interiors {
  /**
   * @return array with shell center and ids of created objects or if failed nothing
   */
  createRoom(planName: string, initPos: number | Vec3): Promise<[Vec3, number[]] | null> {
    return global.exports['dg-build'].createRoom(planName, initPos);
  }

  exitRoom(overrideExitPos?: number[] | Vec3) {
    global.exports['dg-build'].exitRoom(overrideExitPos);
  }

  isInBuilding(): boolean {
    return global.exports['dg-build'].isInBuilding();
  }
}

export class PropAttach {
  public add = (objName: string, offset?: Vec3): number => {
    return global.exports['dg-misc'].addProp(objName, offset);
  };

  public remove = (objId: number) => {
    global.exports['dg-misc'].removeProp(objId);
  };

  public move = (objId: number, offset: Vec3) => {
    global.exports['dg-misc'].moveProp(objId, offset);
  };

  public toggleProps = (state: boolean) => {
    global.exports['dg-misc'].toggleProps(state);
  };
}

export class Particle {
  add = (data: Particles.Particle): string => {
    return global.exports['dg-misc'].addParticle(data);
  };
  remove = (id: string) => {
    global.exports['dg-misc'].removeParticle(id);
  };
}

export class Animations {
  startTabletAnimation() {
    global.exports['dg-misc'].startTabletAnimation();
  }

  stopTabletAnimation() {
    global.exports['dg-misc'].stopTabletAnimation();
  }
}

class StaticObjects {
  private objectsToRemove: Set<string>;

  constructor() {
    this.objectsToRemove = new Set();
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      global.exports['dg-misc'].removeStaticObject([...this.objectsToRemove]);
    });
  }

  public add = async (objectData: StaticObjects.CreateData | StaticObjects.CreateData[]): Promise<string[]> => {
    const ids: string[] = await global.exports['dg-misc'].addStaticObject(objectData);

    ids.forEach(id => {
      this.objectsToRemove.add(id);
    });
    return ids;
  };

  public remove = (objId: string | string[]) => {
    if (Array.isArray(objId)) {
      objId.forEach(id => this.objectsToRemove.delete(id));
    } else {
      this.objectsToRemove.delete(objId);
    }

    global.exports['dg-misc'].removeStaticObject(objId);
  };

  public getEntityForObjectId = (objId: string): number | undefined => {
    return global.exports['dg-misc'].getEntityForObjectId(objId);
  };
}

export default {
  Util: new Util(),
  Interiors: new Interiors(),
  PropAttach: new PropAttach(),
  Particle: new Particle(),
  Animations: new Animations(),
  StaticObjects: new StaticObjects(),
};
