import { Util as UtilShared } from '../../shared/classes/util';
import { firstNames, lastNames } from '../data/names';

class Util extends UtilShared {
  Notify = (
    src: number,
    text: string,
    type: 'success' | 'error' | 'primary' = 'primary',
    timeout = 5000,
    persistent?: boolean
  ) => {
    emitNet('DGCore:Notify', src, text, type, timeout, persistent);
  };
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
        cid: ply.PlayerData.citizenid,
        serverId: ply.PlayerData.source,
        name: ply.PlayerData.name
      };
    }
    global.exports["dg-logs"].createGraylogEntry(type, data, message, isDevImportant);
  }

  getPlyCoords(src = -1) {
    const plyPed = GetPlayerPed(String(src));
    return this.getEntityCoords(plyPed);
  }
  
  getEntityCoords(entity: number) {
    const entityCoords = GetEntityCoords(entity);
    return this.ArrayToVector3(entityCoords);
  }
}

export default {
  Util: new Util(),
};
