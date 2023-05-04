import { getPlayer } from '../helpers/core';
import { Util as UtilShared } from '../../shared/classes/util';
import { firstNames, lastNames } from '../data/names';

import { Config, Core, Events, RPC } from './index';

class Util extends UtilShared {
  private charModule: Core.ServerModules.CharacterModule | undefined;
  constructor() {
    super();
    setImmediate(() => {
      this.charModule = Core.getModule('characters');
    });
  }

  generateName = (): string => {
    const firstName = firstNames[this.getRndInteger(0, firstNames.length - 1)];
    const lastName = lastNames[this.getRndInteger(0, lastNames.length - 1)];
    return `${firstName} ${lastName}`;
  };

  Log(type: string, data: { [k: string]: any }, message: string, src?: number, isDevImportant = false) {
    try {
      if (src && src > 0) {
        const ply = getPlayer(src);
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
  getCID(src: number, ignoreUndefined = false): number {
    const Player = getPlayer(src);
    const cid = Player?.citizenid;
    if (!ignoreUndefined && cid === undefined)
      throw new Error('Tried to get CID of player that is not known to server');
    return cid;
  }

  getName(src: number | string) {
    return GetPlayerName(String(src));
  }

  async getCharName(cid: number) {
    const player = await this.charModule?.getOfflinePlayer(cid);
    return player ? `${player.charinfo.firstname} ${player.charinfo.lastname}` : '';
  }

  getClosestPlayer = (src: number, maxDistance = 2) => {
    const originCoords = this.getPlyCoords(src);
    const players = this.getAllPlayers();

    let closestPlayer: number | undefined = undefined;
    let closestDistance = maxDistance;

    for (const plyId of players) {
      if (plyId === src) continue;
      const playerCoords = this.getPlyCoords(plyId);
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
      const playerCoords = this.getPlyCoords(plyId);
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
      .filter(ped => !onlyPlayers || IsPedAPlayer(ped))
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

  public awaitEntityExistence = (entity: number, isNetId = false): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      let attempts = 0;
      const interval = setInterval(() => {
        const ent = isNetId ? NetworkGetEntityFromNetworkId(entity) : entity;
        attempts++;
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

  public onCharSpawn = (handler: (plyId: number, isNewCharacter: boolean) => void) => {
    onNet('dg-chars:server:finishSpawn', (isNewCharacter: boolean) => {
      handler(source, isNewCharacter);
    });
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

  constructor() {
    this.objectsToRemove = new Set();
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      global.exports['dg-misc'].removeSyncedObject([...this.objectsToRemove]);
    });
  }

  public add = async (objs: Objects.SyncedCreateData | Objects.SyncedCreateData[], src?: number): Promise<string[]> => {
    const ids = (await global.exports['dg-misc'].addSyncedObject(Array.isArray(objs) ? objs : [objs], src)) as string[];

    ids.forEach(id => {
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

  public remove = (model: number, coords: Vec2): number => {
    const propId = global.exports['dg-misc'].addRemovedProp({ model, coords });
    this.objectsToRestore.add(propId);
    return propId;
  };

  public restore = (propId: number) => {
    global.exports['dg-misc'].restoreRemovedProp(propId);
    this.objectsToRestore.delete(propId);
  };
}

export default {
  Util: new Util(),
  Status: new Status(),
  Reputations: new Reputations(),
  SyncedObjects: new SyncedObjects(),
  PropRemover: new PropRemover(),
};
