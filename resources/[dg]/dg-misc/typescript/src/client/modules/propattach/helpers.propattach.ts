import { PROPS } from './constants.propattach';

export const debug = (msg: string) => {
  console.log(`[PropAttach] ${msg}`);
};

export const deleteEntity = (entity: number) => {
  SetEntityAsMissionEntity(entity, true, true);
  DeleteEntity(entity);
};

/**
 * Model should already be loaded!
 */
export const createEntity = (ped: number, name: string, offset: Vec3) => {
  const info = PROPS[name];
  if (!info) {
    debug(`Tried to create prop but name ${name} is not registered`);
    return;
  }

  const hash = GetHashKey(info.model);
  if (!HasModelLoaded(hash)) {
    debug(`Tried to create prop but ${info.model} was not loaded`);
    return;
  }

  const [x, y, z] = GetEntityCoords(ped, false);
  const entity = CreateObject(hash, x, y, z, false, false, false);

  if (!entity || !DoesEntityExist(entity)) {
    debug(`Failed to create prop ${name} | entity: ${entity}`);
    return;
  }

  const boneIdx = GetPedBoneIndex(ped, info.boneId);
  AttachEntityToEntity(
    entity,
    ped,
    boneIdx,
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
