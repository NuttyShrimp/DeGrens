import { Events, Util } from '@dgx/client';
import { PROPS } from './constants.propattach';

let currentId = 0;
const attachedProps: Map<number, PropAttach.ActiveProp> = new Map();
let enabled = true;

export const isEnabled = () => enabled;

const debug = (msg: string) => {
  console.log(`[PropAttach] ${msg}`);
};

export const addProp = async (name: string, offset?: Vec3) => {
  offset = offset ?? { x: 0, y: 0, z: 0 };
  let netId: number | null = null;
  if (enabled) {
    const newNetId = await createAndAttachObject(name, offset);
    if (!newNetId) return;
    netId = newNetId;
  }

  currentId++;
  attachedProps.set(currentId, {
    netId,
    name,
    offset,
  });
  return currentId;
};

export const removeProp = (propId: number) => {
  const data = attachedProps.get(propId);
  if (!data) {
    debug(`Tried to remove prop ${propId} but was not an attached prop`);
    return;
  }

  if (data.netId !== null) {
    Events.emitNet('propattach:remove', data.netId);
  }

  attachedProps.delete(propId);
};

export const moveProp = (propId: number, position: Vec3) => {
  const data = attachedProps.get(propId);
  if (!data) {
    debug(`Tried to move prop ${propId} but was not an attached prop`);
    return;
  }

  if (data.netId !== null) {
    const entity = NetworkGetEntityFromNetworkId(data.netId);
    if (!DoesEntityExist(entity)) {
      debug(`Tried to move prop ${propId} but entity does not exist`);
      return;
    }

    const info = PROPS[data.name];
    if (!info) {
      debug(`Tried to move prop but name ${data.name} is not registered`);
      return;
    }

    const ped = PlayerPedId();
    DetachEntity(entity, true, false);
    AttachEntityToEntity(
      entity,
      ped,
      GetPedBoneIndex(ped, info.boneId),
      info.position.x + position.x,
      info.position.y + position.y,
      info.position.z + position.z,
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
  }

  data.offset = position;
};

const createAndAttachObject = async (name: string, offset: Vec3) => {
  const info = PROPS[name];
  if (!info) {
    debug(`Tried to add prop but name ${name} is not registered`);
    return;
  }

  const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
  const netId = await Util.createObjectOnServer(info.model, { x, y, z: z - 3 });
  if (netId === 0) {
    debug(`Tried to add prop ${name} but could not spawn object`);
    return;
  }

  if (!NetworkDoesEntityExistWithNetworkId(netId)) {
    debug(`Tried to add prop ${name} but network id ${netId} does not exist on client`);
    return;
  }

  const entity = NetworkGetEntityFromNetworkId(netId);
  if (!entity || !DoesEntityExist(entity)) {
    debug(`Tried to add prop ${name} but entity ${entity} does not exist on client`);
    return;
  }

  const ped = PlayerPedId();
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
  Events.emitNet('propattach:register', netId);

  return netId;
};

export const resetProps = () => {
  attachedProps.clear();
};

export const toggleProps = async (toggle: boolean) => {
  enabled = toggle;

  if (!toggle) {
    attachedProps.forEach(data => {
      Events.emitNet('propattach:remove', data.netId);
      data.netId = null;
    });
  } else {
    attachedProps.forEach(async data => {
      if (data.netId !== null) return;
      const netId = await createAndAttachObject(data.name, data.offset);
      if (!netId) return;
      data.netId = netId;
    });
  }
};
