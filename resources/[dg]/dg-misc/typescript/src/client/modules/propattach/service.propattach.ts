import { Events, Util } from '@dgx/client';
import { PROPS } from './constants.propattach';

let currentId = 0;
const attachedProps: Map<number, PropAttach.ActiveProp> = new Map();

// All actions get delayed till this is true
let isEnabled = false;
export const loadIsEnabled = () => {
  const isSpawned = global.exports['dg-chars'].isSpawned();
  isEnabled = isSpawned;
};

const debug = (msg: string) => {
  console.log(`[PropAttach] ${msg}`);
};

export const addProp = async (name: string, offset?: Vec3) => {
  await new Promise(res =>
    setInterval(() => {
      if (isEnabled) res(null);
    }, 50)
  );

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
  offset = offset ?? { x: 0, y: 0, z: 0 };
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
  SetModelAsNoLongerNeeded(info.model);
  Events.emitNet('propattach:register', netId);

  currentId++;
  attachedProps.set(currentId, {
    netId,
    name,
    offset,
  });
  return currentId;
};

export const removeProp = async (propId: number) => {
  await new Promise(res =>
    setInterval(() => {
      if (isEnabled) res(null);
    }, 50)
  );

  const data = attachedProps.get(propId);
  if (!data) {
    debug(`Tried to remove prop ${propId} but was not an attached prop`);
    return;
  }

  Events.emitNet('propattach:remove', data.netId);
  attachedProps.delete(propId);
};

export const moveProp = async (propId: number, position: Vec3) => {
  await new Promise(res =>
    setInterval(() => {
      if (isEnabled) res(null);
    }, 50)
  );

  const data = attachedProps.get(propId);
  if (!data) {
    debug(`Tried to move prop ${propId} but was not an attached prop`);
    return;
  }

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
  data.offset = position;
};

export const resetProps = () => {
  attachedProps.clear();
};

export const toggleProps = (toggle: boolean) => {
  if (!toggle) {
    // toggle props off
    const pedCoords = Util.getPlyCoords();
    attachedProps.forEach(({ netId }) => {
      const entity = NetworkGetEntityFromNetworkId(netId);
      if (!entity || !DoesEntityExist(entity)) return;
      DetachEntity(entity, true, false);
      SetEntityCoords(entity, pedCoords.x, pedCoords.y, pedCoords.z - 30, false, false, false, false);
      SetEntityVisible(entity, false, false);
    });
  } else {
    // toggles props on
    const ped = PlayerPedId();
    attachedProps.forEach(prop => {
      const entity = NetworkGetEntityFromNetworkId(prop.netId);
      if (!entity || !DoesEntityExist(entity)) return;
      const info = PROPS[prop.name];
      AttachEntityToEntity(
        entity,
        ped,
        GetPedBoneIndex(ped, info.boneId),
        info.position.x + prop.offset.x,
        info.position.y + prop.offset.y,
        info.position.z + prop.offset.z,
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
      SetEntityVisible(entity, true, false);
    });
  }

  isEnabled = toggle;
};
