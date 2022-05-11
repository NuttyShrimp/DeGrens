import { Util as UtilShared } from '../../shared/classes/util';

class Util extends UtilShared {
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
    while (!HasModelLoaded(model)) {
      await this.Delay(10);
    }
  };

  loadAnimDict = async (dict: string) => {
    RequestAnimDict(dict);
    while (!HasAnimDictLoaded(dict)) {
      await this.Delay(10);
    }
  };

  requestEntityControl = async (entity: number) => {
    NetworkRequestControlOfEntity(entity);
    while (!NetworkHasControlOfEntity(entity)) {
      await this.Delay(10);
    }
  };

  doesEntityExist = async (entity: number) => {
    while (!DoesEntityExist(entity)) await this.Delay(10);
  }
}

export default {
  Util: new Util(),
};
