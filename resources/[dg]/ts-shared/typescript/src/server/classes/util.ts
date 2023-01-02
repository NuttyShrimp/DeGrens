import { Util as UtilShared } from '../../shared/classes/util';
import { firstNames, lastNames } from '../data/names';

import { Config, Events, RPC } from './index';

class Util extends UtilShared {
  constructor() {
    super();
  }

  generateName = (): string => {
    const firstName = firstNames[this.getRndInteger(0, firstNames.length - 1)];
    const lastName = lastNames[this.getRndInteger(0, lastNames.length - 1)];
    return `${firstName} ${lastName}`;
  };

  Log(type: string, data: { [k: string]: any }, message: string, src?: number, isDevImportant = false) {
    if (src) {
      const ply = DGCore.Functions.GetPlayer(src);
      if (ply) {
        data = {
          ...data,
          plyInfo: {
            cid: ply.PlayerData.citizenid,
            serverId: ply.PlayerData.source,
            name: ply.PlayerData.name,
            steamId: ply.PlayerData.steamid,
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
    global.exports['dg-logs'].createGraylogEntry(type, data, message, isDevImportant);
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
    return Config.getConfigValue<boolean>('main.production') === false;
  }

  /**
   * @param ignoreUndefined if true an error will not get thrown whenever the citizenid was not found
   * @returns citizenid of player associated with playerid
   */
  getCID(src: number, ignoreUndefined = false): number {
    // For some reason global DGCore obj is not defined, when using this function inside Inventory.onInventoryUpdate handler
    const _DGCore = global.exports['dg-core'].GetSharedObject() as Server;
    const Player = _DGCore.Functions.GetPlayer(src);
    const cid = Player?.PlayerData?.citizenid;
    if (!ignoreUndefined && cid === undefined)
      throw new Error('Tried to get CID of player that is not known to server');
    return cid;
  }

  getName(src: number | string) {
    return GetPlayerName(String(src));
  }

  async getCharName(cid: number) {
    const _DGCore = global.exports['dg-core'].GetSharedObject() as Server;
    const player = await _DGCore.Functions.GetOfflinePlayerByCitizenId(cid);
    return `${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}`;
  }

  getClosestPlayer = (src: number, maxDistance = 2) => {
    const _DGCore = global.exports['dg-core'].GetSharedObject() as Server;
    const originCoords = this.getPlyCoords(src);
    const players = _DGCore.Functions.GetPlayers();

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
    const _DGCore = global.exports['dg-core'].GetSharedObject() as Server;
    const originCoords = this.getPlyCoords(src);
    const players = _DGCore.Functions.GetPlayers();
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

  // This way is more effecient than
  // getting amount of seats for a client ->
  // iterating over seatamount ->
  // getting ped in seat ->
  // looping through players to find playerid that belongs to ped
  getPlayersInVehicle = (vehicle: number): number[] => {
    const playersInVehicle = [];
    for (const plyId of DGCore.Functions.GetPlayers()) {
      const plyPed = GetPlayerPed(String(plyId));
      const vehiclePedIsIn = GetVehiclePedIsIn(plyPed, false);
      if (vehiclePedIsIn !== vehicle) continue;
      playersInVehicle.push(plyId);
    }
    return playersInVehicle;
  };

  changePlayerStress = (plyId: number, amount: number) => {
    global.exports['dg-misc'].changeStress(plyId, amount);
  };

  getAmountOfPlayers = () => {
    return (DGCore.Functions.GetPlayers() ?? []).length;
  };

  getClosestPlayerOutsideVehicle = (src: number, maxDistance = 2) => {
    const _DGCore = global.exports['dg-core'].GetSharedObject() as Server;
    const originCoords = this.getPlyCoords(src);
    const players = _DGCore.Functions.GetPlayers();

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
}

export class Sounds {
  public playOnEntity = (id: string, name: string, audiobank: string, netId: number) => {
    global.exports['nutty-sounds'].playSoundOnEntity(id, name, audiobank, netId);
  };

  public playFromCoord = (id: string, name: string, audiobank: string, coords: Vec3, range: number) => {
    global.exports['nutty-sounds'].playSoundFromCoord(id, name, audiobank, coords, range);
  };

  public stop = (id: string) => {
    global.exports['nutty-sounds'].stopSound(id);
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
    return this.getPlayerStatuses(plyId).find(s => s === status) !== undefined;
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

export default {
  Util: new Util(),
  Sounds: new Sounds(),
  Status: new Status(),
  Reputations: new Reputations(),
};
