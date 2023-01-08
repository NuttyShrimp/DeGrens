import { RPC } from './index';
import { Util as UtilShared } from '../../shared/classes/util';
import { MOVEMENT_CLIPSET_ENUM } from '../constants';

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

  setVehicleDoorOpen = (vehicle: number, doorId: number, open: boolean) => {
    global.exports['dg-vehicles'].setVehicleDoorOpen(vehicle, doorId, open);
  };

  getVehicleSpeed = (veh: number) => {
    return Math.ceil(GetEntitySpeed(veh) * 3.6);
  };

  /**
   * Spawns ped that will attack all players
   */
  spawnAggressivePed = async (model: string, position: Vec3, heading: number) => {
    const pedModel = GetHashKey(model);
    await this.loadModel(pedModel);
    const ped = CreatePed(4, pedModel, position.x, position.y, position.z, heading, true, true);
    await this.awaitEntityExistence(ped);
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

  goToCoords = async (position: Vec4, timeout = 5000) => {
    const ped = PlayerPedId();
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

  /**
   * Create an object on server
   * @param routingBucket Defaults to routingbucket player is currently in
   * @returns NetworkID or 0 if creating failed
   */
  createObjectOnServer = async (model: string, coords: Vec3, routingBucket?: number): Promise<number> => {
    const netId = await RPC.execute<number>('dgx:createObject', model, coords, routingBucket);
    if (netId) {
      NetworkRequestControlOfNetworkId(netId);
    }
    return netId ?? 0;
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

  getCurrentVehicleInfo = () => {
    const ped = PlayerPedId();
    const vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle === 0 || !DoesEntityExist(vehicle)) return;
    const model = GetEntityModel(vehicle);
    const numSeats = GetVehicleModelNumberOfSeats(model);
    let seat = -1;
    for (let i = -1; i < numSeats - 1; i++) {
      if (GetPedInVehicleSeat(vehicle, i) !== ped) continue;
      seat = i;
      break;
    }
    return {
      vehicle,
      seat,
    };
  };

  getPedMovementClipset = (ped: number): string | undefined => {
    //@ts-ignore
    const clipsetHash = GetPedMovementClipset(ped);
    return MOVEMENT_CLIPSET_ENUM[clipsetHash];
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
  public add = (objName: string, offset?: Vec3): Promise<number | undefined> => {
    return global.exports['dg-misc'].addProp(objName, offset);
  };

  public remove = (objId: number) => {
    global.exports['dg-misc'].removeProp(objId);
  };

  public move = (objId: number, offset?: Vec3) => {
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

export class Sounds {
  public playOnEntity = (id: string, name: string, audiobank: string, entity: number) => {
    global.exports['nutty-sounds'].playSoundOnEntity(id, name, audiobank, entity);
  };

  public playFromCoord = (id: string, name: string, audiobank: string, coords: Vec3, range: number) => {
    global.exports['nutty-sounds'].playSoundFromCoord(id, name, audiobank, coords, range);
  };

  public stop = (id: string) => {
    global.exports['nutty-sounds'].stopSound(id);
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

export default {
  Util: new Util(),
  Interiors: new Interiors(),
  PropAttach: new PropAttach(),
  Particle: new Particle(),
  Sounds: new Sounds(),
  Animations: new Animations(),
};
