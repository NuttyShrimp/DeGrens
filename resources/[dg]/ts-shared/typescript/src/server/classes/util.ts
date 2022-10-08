import { Util as UtilShared } from '../../shared/classes/util';
import { firstNames, lastNames } from '../data/names';

import { Config, RPC } from './index';

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
      data = {
        ...data,
        plyInfo: {
          cid: ply.PlayerData.citizenid,
          serverId: ply.PlayerData.source,
          name: ply.PlayerData.name,
          steamId: ply.PlayerData.steamid,
        },
      };
    }
    global.exports['dg-logs'].createGraylogEntry(type, data, message, isDevImportant);
  }

  getPlyCoords(src = -1) {
    const plyPed = GetPlayerPed(String(src));
    return this.getEntityCoords(plyPed);
  }

  getEntityCoords(entity: number) {
    const entityCoords = GetEntityCoords(entity);
    return this.ArrayToVector3(entityCoords);
  }

  isEntityDead(entity: number): Promise<boolean> {
    const entityNetId = NetworkGetEntityFromNetworkId(entity);
    return RPC.execute<boolean>('dgx:util:isEntityDead', entityNetId) as Promise<boolean>;
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
}

export default {
  Util: new Util(),
};
