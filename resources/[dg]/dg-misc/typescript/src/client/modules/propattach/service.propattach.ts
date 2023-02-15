import { Events, Util } from '@dgx/client';
import { PROPS } from './constants.propattach';

let currentId = 0;
const attachedProps: Map<number, PropAttach.ActiveProp> = new Map();
let enabled = true;

let existenceThread: NodeJS.Timer | null = null;

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
  startExistenceThread();
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
  clearExistenceThread();
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
  const { netId, entity } = await Util.createObjectOnServer(info.model, { x, y, z: z - 3 });

  if (!entity || !netId) {
    debug(`Failed to create prop ${name} | netId: ${netId} | entity: ${entity}`);
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
  clearExistenceThread();
};

export const toggleProps = async (toggle: boolean) => {
  enabled = toggle;

  if (!toggle) {
    attachedProps.forEach(data => {
      if (data.netId === null) return;
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

// Existence thread checks if every attached prop entity still exists, else reapply prop
// Can happen when teleporting and entity somehow going out of scope whilst being attached
const startExistenceThread = () => {
  if (existenceThread !== null) return;

  existenceThread = setInterval(() => {
    attachedProps.forEach(async data => {
      if (data.netId === null) return;
      if (NetworkDoesEntityExistWithNetworkId(data.netId)) return;

      debug(`Entity ${data.netId} does not exist anymore, readding ${data.name}`);
      Events.emitNet('propattach:remove', data.netId);
      const netId = await createAndAttachObject(data.name, data.offset);
      data.netId = netId ?? null;
    });
  }, 1000);
};

const clearExistenceThread = () => {
  if (existenceThread === null) return;
  if (attachedProps.size > 0) return;

  clearInterval(existenceThread);
  existenceThread = null;
};
