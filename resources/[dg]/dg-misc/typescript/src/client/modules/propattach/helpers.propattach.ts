import { Util } from '@dgx/client';
import { PROPS } from './constants.propattach';

export const debug = (msg: string) => {
  console.log(`[PropAttach] ${msg}`);
};

export const deleteEntity = (propInfo: PropAttach.ActiveProp) => {
  if (
    propInfo.entity &&
    NetworkGetEntityIsLocal(propInfo.entity) &&
    DoesEntityExist(propInfo.entity) &&
    propInfo.hash === GetEntityModel(propInfo.entity) >>> 0
  ) {
    SetEntityAsMissionEntity(propInfo.entity, true, true);
    DeleteEntity(propInfo.entity);
  }
};

// this shit works because propdata being an object, the offset will get mutated if it happens to be moved during model load (often during charspawn)
export const createEntity = async (ped: number, propData: PropAttach.ActiveProp) => {
  const info = PROPS[propData.name];
  if (!info) {
    debug(`Tried to create prop but name ${propData.name} is not registered`);
    return;
  }

  const hash = GetHashKey(info.model);
  await Util.loadModel(hash);

  if (!HasModelLoaded(hash)) {
    debug(`Tried to create prop but ${info.model} was not loaded`);
    return;
  }

  if (propData.deleted) {
    debug(`Prop was deleted before model got loaded`);
    return;
  }

  const entity = CreateObject(hash, 0, 0, 0, false, false, false);

  if (!entity || !DoesEntityExist(entity)) {
    debug(`Failed to create prop ${propData.name} | entity: ${entity}`);
    return;
  }

  const boneIdx = GetPedBoneIndex(ped, info.boneId);
  AttachEntityToEntity(
    entity,
    ped,
    boneIdx,
    info.position.x + propData.offset.x,
    info.position.y + propData.offset.y,
    info.position.z + propData.offset.z,
    info.rotation.x,
    info.rotation.y,
    info.rotation.z,
    true,
    true,
    false,
    false,
    2,
    true
  );
  SetEntityCompletelyDisableCollision(entity, false, true);
  SetModelAsNoLongerNeeded(hash);

  return entity;
};

export const moveEntity = (ped: number, entity: number, name: string, offset: Vec3) => {
  const info = PROPS[name];
  if (!info) {
    debug(`Tried to create prop but name ${name} is not registered`);
    return;
  }

  DetachEntity(entity, true, false);
  AttachEntityToEntity(
    entity,
    ped,
    GetPedBoneIndex(ped, info.boneId),
    info.position.x + offset.x,
    info.position.y + offset.y,
    info.position.z + offset.z,
    info.rotation.x,
    info.rotation.y,
    info.rotation.z,
    true,
    true,
    false,
    false,
    2,
    true
  );
  SetEntityCompletelyDisableCollision(entity, false, true);
};
