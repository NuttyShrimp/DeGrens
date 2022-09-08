import { Util as UtilShared } from '../../shared/classes/util';

import { registerDGXRPC } from './events';

class Util extends UtilShared {
  private prodEnv!: boolean;

  constructor() {
    super();
    registerDGXRPC('dgx:util:isEntityDead', (entityNetId: number) => {
      const entity = NetworkGetEntityFromNetworkId(entityNetId);
      if (!entity) return false;
      return IsEntityDead(entity);
    });
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
    return boneCoords.subtract(this.getPlyCoords()).Length;
  }

  loadModel = async (model: string | number) => {
    RequestModel(model);
    await this.awaitCondition(() => HasModelLoaded(model));
  };

  loadAnimDict = async (dict: string) => {
    RequestAnimDict(dict);
    await this.awaitCondition(() => HasAnimDictLoaded(dict));
  };

  requestEntityControl = async (entity: number) => {
    NetworkRequestControlOfEntity(entity);
    await this.awaitCondition(() => NetworkHasControlOfEntity(entity));
  };

  doesEntityExist = async (entity: number) => {
    await this.awaitCondition(() => DoesEntityExist(entity));
  };

  isDevEnv() {
    return this.prodEnv !== undefined && this.prodEnv === false;
  }

  loadAnimSet = async (set: string) => {
    RequestAnimSet(set);
    await this.awaitCondition(() => HasAnimSetLoaded(set));
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
  add = (objName: string, offset?: Vec3): Promise<number> => global.exports['dg-propattach'].add(objName, offset);
  remove = (objId: number) => global.exports['dg-propattach'].remove(objId);
  move = (objId: number, offset?: Vec3): Promise<number> => global.exports['dg-propattach'].move(objId, offset);
}

export default {
  Util: new Util(),
  Interiors: new Interiors(),
  PropAttach: new PropAttach(),
};
