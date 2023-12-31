import { Util as UtilShared } from '@dgx/shared/src/classes';

import { firstNames, lastNames } from '../data/names';

import { Config, Core, Events, RPC } from './index';

class Util extends UtilShared {
  generateName = (seed?: string): string => {
    let firstNameIdx = this.getRndInteger(0, firstNames.length - 1);
    let lastNameIdx = this.getRndInteger(0, lastNames.length - 1);
    if (seed) {
      firstNameIdx = seed.split('').reduce((s, v) => s + v.charCodeAt(0), 0) % firstNames.length;
      lastNameIdx = seed.split('').reduce((s, v) => s + v.charCodeAt(0), 0) % lastNames.length;
    }
    const firstName = firstNames[firstNameIdx];
    const lastName = lastNames[lastNameIdx];
    return `${firstName} ${lastName}`;
  };

  Log(type: string, data: { [k: string]: any }, message: string, src?: number, isDevImportant = false) {
    try {
      if (src && src > 0) {
        const ply = Core.getPlayer(src);
        if (ply) {
          data = {
            ...data,
            plyInfo: {
              cid: ply.citizenid,
              serverId: ply.serverId,
              name: ply.name,
              steamId: ply.steamId,
            },
          };
        } else {
          data = {
            ...data,
            plyInfo: {
              name: this.getName(src),
              steamId: Player(src).state.steamId,
              serverId: src,
            },
          };
        }
      }
      data.resource = GetCurrentResourceName();
      if (data.resource === 'ts-shared') {
        data.resource = GetInvokingResource();
      }
      global.exports['dg-logs'].createGraylogEntry(type, data, message, isDevImportant);
    } catch (e) {
      console.error(e);
      console.log('Failed to log error to graylog', type, data, message, src, isDevImportant);
    }
  }

  getPlyCoords(plyId: number) {
    const plyPed = GetPlayerPed(String(plyId));
    return this.getEntityCoords(plyPed);
  }

  getEntityCoords(entity: number) {
    const entityCoords = GetEntityCoords(entity);
    return this.ArrayToVector3(entityCoords);
  }

  isEntityDead(entity: number, target?: number): Promise<boolean | null> {
    const entityNetId = NetworkGetNetworkIdFromEntity(entity);
    if (!target) {
      target = NetworkGetEntityOwner(entityNetId);
    }
    if (!target) {
      throw new Error(`Could not find owner for entity ${entity}`);
    }
    return RPC.execute<boolean>('dgx:util:isEntityDead', target, entityNetId);
  }

  isDevEnv() {
    if (!Config.areConfigsReady()) {
      console.log('[DGX] Configs were not ready yet while calling isDevEnv');
      return false;
    }
    return Config.getConfigValue<boolean>('main.production') === false;
  }

  /**
   * @param ignoreUndefined if true an error will not get thrown whenever the citizenid was not found
   * @returns citizenid of player associated with playerid
   */
  getCID(src: number, ignoreUndefined?: false): number;
  getCID(src: number, ignoreUndefined: true): number | undefined;
  getCID(src: number, ignoreUndefined = false) {
    const Player = Core.getPlayer(src);
    const cid = Player?.citizenid;
    if (!ignoreUndefined && cid === undefined)
      throw new Error('Tried to get CID of player that is not known to server');
    return cid;
  }

  getName(src: number | string) {
    return GetPlayerName(String(src));
  }

  getIdentifier(src: number | string) {
    return `${this.getName(src)}(${this.getCID(Number(src), true)} | ${Player(src).state.steamId})`;
  }

  async getCharName(cid: number) {
    const charModule = Core.getModule('characters');
    const player = await charModule?.getOfflinePlayer(cid);
    return player ? `${player.charinfo.firstname} ${player.charinfo.lastname}` : '';
  }

  getClosestPlayer = (src: number, maxDistance = 2) => {
    const originCoords = this.getPlyCoords(src);
    const players = this.getAllPlayers();

    let closestPlayer: number | undefined = undefined;
    let closestDistance = maxDistance;

    for (const plyId of players) {
      if (plyId === src) continue;
      const ped = GetPlayerPed(String(plyId));
      if (!DoesEntityExist(ped)) continue;
      const playerCoords = this.getEntityCoords(ped);
      const distance = originCoords.distance(playerCoords);
      if (distance > closestDistance) continue;
      closestPlayer = plyId;
      closestDistance = distance;
    }

    return closestPlayer;
  };

  getAllPlayersInRange = (src: number, maxDistance = 2) => {
    const originCoords = this.getPlyCoords(src);
    const players = this.getAllPlayers();
    const playerIds: number[] = [];
    for (const plyId of players) {
      if (plyId === src) continue;
      const ped = GetPlayerPed(String(plyId));
      if (!DoesEntityExist(ped)) continue;
      const playerCoords = this.getEntityCoords(ped);
      if (originCoords.distance(playerCoords) > maxDistance) continue;
      playerIds.push(plyId);
    }
    return playerIds;
  };

  isAnyVehicleInRange = (coords: Vec3, range: number) => {
    const allVehicles: number[] = GetAllVehicles();
    const anyInRange = allVehicles.some(veh => this.getEntityCoords(veh).distance(coords) <= range);
    return anyInRange;
  };

  isAnyPedInRange = (coords: Vec3, range: number, onlyPlayers = false) => {
    const allPeds: number[] = GetAllPeds();
    const anyInRange = allPeds
      .filter(ped => DoesEntityExist(ped) && (!onlyPlayers || IsPedAPlayer(ped)))
      .some(ped => this.getEntityCoords(ped).distance(coords) <= range);
    return anyInRange;
  };

  sendEventToEntityOwner = (entity: number, event: string, ...params: any[]) => {
    const owner = NetworkGetEntityOwner(entity);
    if (owner !== 0) {
      Events.emitNet(event, owner, ...params);
      return;
    }
    this.Log(
      'dgx:util:noEntityOwner',
      {
        event,
        ...params,
      },
      `Could not find entity owner to emit event to (${event})`,
      undefined,
      true
    );
  };

  sendRPCtoEntityOwner = async <T = any>(entity: number, event: string, ...params: any[]): Promise<T | null> => {
    const owner = NetworkGetEntityOwner(entity);
    if (owner !== 0) {
      return RPC.execute<T>(event, owner, ...params);
    }
    this.Log(
      'dgx:util:noEntityOwner',
      {
        event,
        ...params,
      },
      `Could not find entity owner to emit RPC event to (${event})`,
      undefined,
      true
    );
    return null;
  };

  // Default to 10 seats
  getPlayersInVehicle = (vehicle: number, amountOfSeats = 10): number[] => {
    const playersInVehicle = [];

    for (let i = -1; i < amountOfSeats - 1; i++) {
      const ped = GetPedInVehicleSeat(vehicle, i);
      if (!ped || !IsPedAPlayer(ped)) continue;
      playersInVehicle.push(NetworkGetEntityOwner(ped));
    }
    return playersInVehicle;
  };

  changePlayerStress = (plyId: number, amount: number) => {
    global.exports['dg-misc'].changeStress(plyId, amount);
  };

  getClosestPlayerOutsideVehicle = (src: number, maxDistance = 2) => {
    const originCoords = this.getPlyCoords(src);
    const players = this.getAllPlayers();

    let closestPlayer: number | undefined = undefined;
    let closestDistance = maxDistance;

    for (const plyId of players) {
      if (plyId === src) continue;
      const ped = GetPlayerPed(String(plyId));
      if (!DoesEntityExist(ped)) continue;
      if (GetVehiclePedIsIn(ped, false) !== 0) continue;
      const playerCoords = this.getEntityCoords(ped);
      const distance = originCoords.distance(playerCoords);
      if (distance > closestDistance) continue;
      closestPlayer = plyId;
      closestDistance = distance;
    }

    return closestPlayer;
  };

  getAllPlayers() {
    const plyNum = GetNumPlayerIndices();
    const plys: number[] = [];
    for (let i = 0; i < plyNum; i++) {
      plys.push(Number(GetPlayerFromIndex(i)));
    }
    return plys;
  }

  getOffsetFromEntity = (entity: number, offset: Vec3): Vec3 => {
    const entityCoords = this.getEntityCoords(entity);
    const entityHeading = GetEntityHeading(entity);

    return this.getOffsetFromCoords({ ...entityCoords, w: entityHeading }, offset);
  };

  getOffsetFromPlayer = (plyId: number, offset: Vec3): Vec3 => {
    return this.getOffsetFromEntity(GetPlayerPed(String(plyId)), offset);
  };

  setWaypoint = (plyId: number, coords: Vec2) => {
    emitNet('dgx:client:setWaypoint', plyId, coords);
  };

  public isPlayerInWater = (plyId: number) => {
    return RPC.execute('dgx:util:isInWater', plyId);
  };

  public awaitEntityExistence = async (entity: number, isNetId = false): Promise<boolean> => {
    return await this.awaitCondition(() => DoesEntityExist(isNetId ? NetworkGetEntityFromNetworkId(entity) : entity));
  };

  public awaitOwnership = async (entity: number) => {
    await this.awaitCondition(() => !DoesEntityExist(entity) || NetworkGetEntityOwner(entity) > 0, false, 100);
    if (!DoesEntityExist(entity)) return;
    const owner = NetworkGetEntityOwner(entity);
    if (owner <= 0) return;
    return owner;
  };

  public onCharSpawn = (handler: (plyId: number, isNewCharacter: boolean) => void) => {
    onNet('dg-chars:server:finishSpawn', (isNewCharacter: boolean) => {
      handler(source, isNewCharacter);
    });
  };

  getDistanceToPlayer = (src: number, targetSrvId: number) => {
    const srcCoords = this.getPlyCoords(src);
    const targetCoords = this.getPlyCoords(targetSrvId);
    return srcCoords.distance(targetCoords);
  };

  debug = (...msg: any[]) => {
    if (!this.isDevEnv()) return;
    console.log(...msg);
  };
}

export class Status {
  public addStatusToPlayer = (plyId: number, statusName: StatusName) => {
    global.exports['dg-misc'].addStatusToPlayer(plyId, statusName);
  };

  public getPlayerStatuses = (plyId: number): StatusName[] => {
    return global.exports['dg-misc'].getPlayerStatuses(plyId);
  };

  public doesPlayerHaveStatus = (plyId: number, status: StatusName) => {
    return this.getPlayerStatuses(plyId).includes(status);
  };

  public showStatusesToPlayer = (showTo: number, target: number, filter?: StatusName[]) => {
    global.exports['dg-misc'].showStatusesToPlayer(showTo, target, filter);
  };
}

export class Reputations {
  public getReputation = (cid: number, type: ReputationType): number | undefined => {
    return global.exports['dg-misc'].getReputation(cid, type);
  };

  public setReputation = (cid: number, type: ReputationType, cb: (old: number) => number): void => {
    global.exports['dg-misc'].setReputation(cid, type, cb);
  };
}

class SyncedObjects {
  private objectsToRemove: Set<string>;
  private removeHandlers: Set<(ids: string[]) => void>;

  constructor() {
    this.objectsToRemove = new Set();
    this.removeHandlers = new Set();
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      if (this.objectsToRemove.size === 0) return;
      global.exports['dg-misc'].removeSyncedObject([...this.objectsToRemove]);
    });
  }

  public add = async (objs: Objects.SyncedCreateData | Objects.SyncedCreateData[], src?: number): Promise<string[]> => {
    const ids = (await global.exports['dg-misc'].addSyncedObject(Array.isArray(objs) ? objs : [objs], src)) as string[];

    ids.forEach((id, idx) => {
      const obj = Array.isArray(objs) ? objs[idx] : objs;
      if (!obj.skipStore) return;
      this.objectsToRemove.add(id);
    });
    return ids;
  };

  public remove = async (objId: string | string[]) => {
    if (Array.isArray(objId)) {
      objId.forEach(id => this.objectsToRemove.delete(id));
    } else {
      this.objectsToRemove.delete(objId);
    }

    global.exports['dg-misc'].removeSyncedObject(objId);
  };

  public onRemove = (handler: (ids: string[]) => void) => {
    if (this.removeHandlers.size === 0) {
      Events.on('dg-misc:objectmanager:removeSynced', (id: string | string[]) => {
        const ids = Array.isArray(id) ? id : [id];
        this.removeHandlers.forEach(handler => handler(ids));
      });
    }
    this.removeHandlers.add(handler);
  };
}

class PropRemover {
  private objectsToRestore: Set<number>;

  constructor() {
    this.objectsToRestore = new Set();
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      this.objectsToRestore.forEach(propId => {
        global.exports['dg-misc'].restoreRemovedProp(propId);
      });
    });
  }

  public remove = (model: number, coords: Vec3): number => {
    const propId = global.exports['dg-misc'].addRemovedProp({ model, coords });
    this.objectsToRestore.add(propId);
    return propId;
  };

  public restore = (propId: number) => {
    global.exports['dg-misc'].restoreRemovedProp(propId);
    this.objectsToRestore.delete(propId);
  };
}

class Overwrites {
  setOverwrite = (key: string, value: any) => {
    global.exports['dg-misc'].setOverwrite(key, value);
  };

  getOverwrite = <T = any>(key: string): T => {
    return global.exports['dg-misc'].getOverwrite(key);
  };

  removeOverwrite = (key: string) => {
    global.exports['dg-misc'].removeOverwrite(key);
  };
}

export default {
  Util: new Util(),
  Status: new Status(),
  Reputations: new Reputations(),
  SyncedObjects: new SyncedObjects(),
  PropRemover: new PropRemover(),
  Overwrites: new Overwrites(),
};
