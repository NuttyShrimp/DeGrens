import { RPC } from '../classes';
import { Util as UtilShared } from '../../shared/classes/util';

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

  isAnyPlayerCloseAndOutsideVehicle = (maxDistance = 2) => {
    const players: number[] = GetActivePlayers();
    const ownPed = PlayerPedId();
    const ownCoords = this.getPlyCoords();

    for (const plyId of players) {
      const ped = GetPlayerPed(plyId);
      if (ped === ownPed) continue;
      if (IsPedInAnyVehicle(ped, true)) continue;

      const [x, y, z] = GetEntityCoords(ped, false);
      if (ownCoords.distance({ x, y, z }) < (IsPedRagdoll(ped) ? maxDistance + 0.5 : maxDistance)) {
        return true;
      }
    }

    return false;
  };

  getDistanceToClosestPlayerOutsideVehicle = () => {
    const players: number[] = GetActivePlayers();
    const ownPed = PlayerPedId();
    const ownCoords = this.getPlyCoords();

    let closestDistance = 99999;

    for (const plyId of players) {
      const ped = GetPlayerPed(plyId);
      if (ped === ownPed) continue;
      if (IsPedInAnyVehicle(ped, true)) continue;

      const [x, y, z] = GetEntityCoords(ped, false);
      const distance = ownCoords.distance({ x, y, z });
      if (distance > closestDistance) continue;
      closestDistance = distance;
    }

    return closestDistance;
  };

  /**
   * Create an object on server
   * @param routingBucket Defaults to routingbucket player is currently in
   * @returns NetworkID or 0 if creating failed
   */
  createObjectOnServer = async (model: string, coords: Vec3, routingBucket?: number): Promise<number> => {
    const netId = await RPC.execute<number>('dgx:createObject', model, coords, routingBucket);
    return netId ?? 0;
  };

  getClosestPedInRange = (range: number, pedsToIgnore: number[] = []): number | undefined => {
    const plyCoords = this.getPlyCoords();
    const peds: number[] = GetGamePool('CPed');
    const playerPeds = [PlayerPedId, ...GetActivePlayers().map((id: number) => GetPlayerPed(id))];

    let closestPed: number | undefined = undefined;
    let closestDistance = range;

    for (const ped of peds) {
      if (playerPeds.includes(ped)) continue;
      if (pedsToIgnore.includes(ped)) continue;
      const distance = plyCoords.distance(this.getEntityCoords(ped));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPed = ped;
      }
    }

    return closestPed;
  };

  debug(...args: any[]) {
    if (!this.isDevEnv()) return;
    console.log(...args);
  }
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
