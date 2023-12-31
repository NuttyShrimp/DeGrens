import { Events, RPC } from './index';
import { Thread, Util as UtilShared } from '@dgx/shared/src/classes';
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
    if (typeof model === 'string') {
      model = GetHashKey(model);
    }
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

  loadScaleform = async (scaleformName: string) => {
    const scaleform = RequestScaleformMovie(scaleformName);
    await this.awaitCondition(() => HasScaleformMovieLoaded(scaleform));
    return scaleform;
  };

  loadPtfx = (ptfx: string) => {
    RequestNamedPtfxAsset(ptfx);
    return this.awaitCondition(() => HasNamedPtfxAssetLoaded(ptfx));
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

  isAnyPlayerClose = (options: { range: number; skipInVehicle?: boolean }) => {
    return this.getClosestPlayer({ ...options, getFirstInRange: true }) != undefined;
  };

  /**
   * @returns playerId (not serverId)
   */
  getClosestPlayer = (options: { range: number; skipInVehicle?: boolean; getFirstInRange?: boolean }) => {
    const players: number[] = GetActivePlayers();
    const ownPed = PlayerPedId();
    const ownCoords = this.getEntityCoords(ownPed);

    let closestDistance = options.range ?? 9999;
    let closestPly: number | undefined = undefined;

    for (const plyId of players) {
      const ped = GetPlayerPed(plyId);
      if (ped === ownPed || !DoesEntityExist(ped)) continue;
      if (options.skipInVehicle && IsPedInAnyVehicle(ped, true)) continue;

      const coords = this.getEntityCoords(ped);
      let distance = ownCoords.distance(coords);

      if (IsPedRagdoll(ped)) {
        distance = Math.max(0, distance - 0.5);
      }
      if (distance > closestDistance) continue;

      // dont care if closest, just return any player in range
      if (options.getFirstInRange) return plyId;

      closestDistance = distance;
      closestPly = plyId;
    }

    return closestPly;
  };

  getDistanceToClosestPlayer = (options: { skipInVehicle?: boolean }) => {
    const maxDistance = 999999;
    const closestPly = this.getClosestPlayer({
      range: maxDistance,
      skipInVehicle: options.skipInVehicle,
    });
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
  ): Promise<{ netId: number; entity: number } | undefined> => {
    const netId = await RPC.execute<number>('dgx:createEntity', entityType, model, coords, routingBucket, stateBags);
    if (!netId) return;
    const exists = await this.awaitEntityExistence(netId, true);
    if (!exists) return;
    const entity = NetworkGetEntityFromNetworkId(netId);
    await this.requestEntityControl(entity);
    return { netId, entity };
  };

  createObjectOnServer = (
    model: string | number,
    coords: Vec3 | Vec4,
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

  getClosestNpc = (range: number, pedsToIgnore: number[] = []): number | undefined => {
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

  getClosestObject = (range: number, entsToIgnore: number[] = [], entityHash: number): number | undefined => {
    const plyCoords = this.getPlyCoords();
    const objects: number[] = GetGamePool('CObject');

    let closestObject: number | undefined = undefined;
    let closestDistance = range;

    for (const object of objects) {
      if (entsToIgnore.includes(object) || GetEntityModel(object) !== entityHash) continue;
      const distance = plyCoords.distance(this.getEntityCoords(object));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestObject = object;
      }
    }

    return closestObject;
  };

  debug(msg: string) {
    if (!this.isDevEnv()) return;
    console.log(`[${GetCurrentResourceName()}] ${msg}`);
  }

  getServerIdForPed(ped: number) {
    const owner = NetworkGetEntityOwner(ped);
    return ped === GetPlayerPed(owner) ? GetPlayerServerId(owner) : 0;
  }

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
    return this.getHeadingToFaceCoordsFromCoord(pedCoords, coords);
  };

  public getPreferences = <T extends Record<string, any>>(): DeepPartial<T> => {
    return global.exports['dg-misc'].getPreferences();
  };

  public onPreferenceChange = <T extends Record<string, any>>(handler: (preferences: DeepPartial<T>) => void) => {
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

  public awaitEntityExistence = async (entity: number, isNetId = false): Promise<boolean> => {
    const exists = await this.awaitCondition(() => {
      // entity is netid here
      if (isNetId && (!NetworkDoesNetworkIdExist(entity) || !NetworkDoesEntityExistWithNetworkId(entity))) return false;
      const ent = isNetId ? NetworkGetEntityFromNetworkId(entity) : entity;
      return DoesEntityExist(ent);
    });
    return exists;
  };

  public average = (arr: number[]) => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  public onCharSpawn = (handler: (isNewCharacter: boolean) => void) => {
    on('dg-chars:finishSpawn', handler);
  };

  public startFirstPersonCam = (): Promise<void> => {
    return global.exports['dg-misc'].startFirstPersonCam();
  };

  public isFirstPersonCamEnabled = (): boolean => {
    return global.exports['dg-misc'].isFirstPersonCamEnabled();
  };

  drawText3d = (text: string, origin: Vec3, scale: number, hasBackground = false, textFont = 6) => {
    const [onScreen, x, y] = GetScreenCoordFromWorldCoord(origin.x, origin.y, origin.z);
    if (!onScreen) return;

    SetTextScale(scale, scale);
    SetTextFont(textFont);
    SetTextProportional(true);
    SetTextOutline();
    SetTextDropShadow();
    SetTextColour(255, 255, 255, 255);
    BeginTextCommandDisplayText('STRING');
    SetTextCentre(true);
    AddTextComponentSubstringPlayerName(text);
    DrawText(x, y);
    if (hasBackground) {
      const factor = text.length / 370;
      DrawRect(x, y + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75);
    }
  };

  startGhostPlacement = (
    model: string,
    maxDistance = 5,
    ACCEPTED_MATERIALS?: string[]
  ): Promise<{ coords: Vec3; rotation: Vec3 } | null> => {
    return global.exports['dg-misc'].startGhostPlacement(model, maxDistance, ACCEPTED_MATERIALS);
  };

  public toggleScreenFadeOut = async (enabled: boolean, time: number) => {
    if (IsScreenFadedOut() == enabled) return; // if already this state, do nothing

    enabled ? DoScreenFadeOut(time) : DoScreenFadeIn(time);

    const success = await this.awaitCondition(() => !!IsScreenFadedOut() === enabled, time * 2);
    if (success) return;

    // if we failed to fade out, just set it to the state we want instantly
    enabled ? DoScreenFadeOut(0) : DoScreenFadeIn(0);
  };

  public enterCamera = (camInfo: Misc.Cameras.Info): Promise<void> => {
    return global.exports['dg-misc'].enterCamera(camInfo);
  };

  public exitCamera = (): Promise<void> => {
    return global.exports['dg-misc'].exitCamera();
  };

  public isCameraActive = (): boolean => {
    return global.exports['dg-misc'].isCameraActive();
  };

  // this shit is so dumb fuckme
  public loadCollisionAroundCoord = async (coords: Vec3) => {
    const hash = GetHashKey('prop_ld_test_01'); // gta test object with like no polys
    await this.loadModel(hash);
    const tempEnt = CreateObject(hash, coords.x, coords.y, coords.z, false, false, false);
    SetModelAsNoLongerNeeded(hash);
    await this.loadCollisionAroundEntity(tempEnt);
    DeleteEntity(tempEnt);
  };

  public loadCollisionAroundEntity = async (entity: number) => {
    const coords = this.getEntityCoords(entity);
    RequestCollisionAtCoord(coords.x, coords.y, coords.z);
    await this.awaitCondition(() => HasCollisionLoadedAroundEntity(entity));
  };

  public gridThreadGenerator = (interval: number, chunk_size: number, cb: (chunk: number) => void) => {
    const thread = new Thread(
      () => {
        const pos = this.getPlyCoords();
        const newChunk = this.getChunkForPos(pos, chunk_size);
        if (newChunk === thread.data.chunk) return;
        thread.data.chunk = newChunk;
        cb(newChunk);
      },
      interval,
      'interval'
    );
    thread.addHook('preStart', () => {
      const pos = this.getPlyCoords();
      thread.data.chunk = this.getChunkForPos(pos, chunk_size);
    });
    return thread;
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
  public add = (objName: string, offset?: Vec3, overrideModel?: string | number): number => {
    return global.exports['dg-misc'].addProp(objName, offset, overrideModel);
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

export class Animations {
  startTabletAnimation() {
    global.exports['dg-misc'].startTabletAnimation();
  }

  stopTabletAnimation() {
    global.exports['dg-misc'].stopTabletAnimation();
  }

  doLaptopHackAnimation = (hackFunc?: () => Promise<boolean>): Promise<boolean> => {
    return global.exports['dg-misc'].doLaptopHackAnimation(hackFunc);
  };

  /**
   * @returns id to be used to cancel later
   */
  public startAnimLoop = (animLoop: AnimLoops.Anim): number => {
    return global.exports['dg-misc'].startAnimLoop(animLoop);
  };

  public stopAnimLoop = (animLoopId: number) => {
    global.exports['dg-misc'].stopAnimLoop(animLoopId);
  };

  public modifyAnimLoop = (animLoopId: number, partialAnimLoop: Partial<AnimLoops.Anim>) => {
    global.exports['dg-misc'].modifyAnimLoop(animLoopId, partialAnimLoop);
  };

  public pauseAnimLoopAnimations = (pause: boolean) => {
    global.exports['dg-misc'].setAnimLoopAnimationsPaused(pause);
  };
}

class SyncedObjects {
  private objectsToRemove: Set<string>;

  constructor() {
    this.objectsToRemove = new Set();
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      global.exports['dg-misc'].removeObject([...this.objectsToRemove]);
    });
  }

  public add = (objectData: Objects.CreateData | Objects.CreateData[]): string[] => {
    const ids: string[] = global.exports['dg-misc'].addLocalObject(objectData);

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

    global.exports['dg-misc'].removeObject(objId);
  };

  public getEntityForObjectId = (objId: string): number | undefined => {
    return global.exports['dg-misc'].getEntityForObjectId(objId);
  };
}

export default {
  Util: new Util(),
  Interiors: new Interiors(),
  PropAttach: new PropAttach(),
  Animations: new Animations(),
  SyncedObjects: new SyncedObjects(),
};
