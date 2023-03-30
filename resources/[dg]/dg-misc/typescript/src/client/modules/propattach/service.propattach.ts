import { PROPS } from './constants.propattach';
import { createEntity, debug, deleteEntity, moveEntity } from './helpers.propattach';
import { Vector3 } from '@dgx/shared';

let currentId = 0;
let enabled = true;

let attachedProps: Record<number, PropAttach.Prop> = {};
let toggledProps: Record<number, PropAttach.Prop> = {};

let propsPerPlayer: Record<number, Record<number, PropAttach.ActiveProp>> = {};

export const isEnabled = () => enabled;

const updateState = () => {
  LocalPlayer.state.set('propattach', attachedProps, true);
};

export const addProp = (name: string, offset?: Vec3) => {
  offset = offset ?? { x: 0, y: 0, z: 0 };

  currentId++;

  // if enabled add to state, else add to toggled
  if (enabled) {
    attachedProps[currentId] = {
      name,
      offset,
    };
    updateState();
  } else {
    toggledProps[currentId] = {
      name,
      offset,
    };
  }

  return currentId;
};

export const removeProp = (propId: number) => {
  const activeProp = enabled ? attachedProps[propId] : toggledProps[propId];
  if (!activeProp) {
    debug(`Tried to remove prop ${propId} but was not an attached prop`);
    return;
  }

  if (enabled) {
    delete attachedProps[propId];
    updateState();
  } else {
    delete toggledProps[propId];
  }
};

export const moveProp = (propId: number, position: Vec3) => {
  const activeProp = enabled ? attachedProps[propId] : toggledProps[propId];
  if (!activeProp) {
    debug(`Tried to move prop ${propId} but was not an attached prop`);
    return;
  }

  activeProp.offset = position;

  if (enabled) {
    updateState();
  }
};

export const resetProps = () => {
  attachedProps = {};
  toggledProps = {};
  updateState();
};

export const toggleProps = (toggle: boolean) => {
  if (enabled === toggle) return;

  if (toggle) {
    attachedProps = toggledProps;
    toggledProps = {};
  } else {
    toggledProps = attachedProps;
    attachedProps = {};
  }

  enabled = toggle;
  updateState();
};

export const handlePlayerStateUpdate = (plyId: number, newPlayerProps: Record<number, PropAttach.Prop>) => {
  const ped = GetPlayerPed(GetPlayerFromServerId(plyId));

  // first remove old props that are no longer in new state
  const oldPlayerProps = (propsPerPlayer[plyId] ??= {});
  for (const key of Object.keys(oldPlayerProps)) {
    const propId = Number(key);
    if (newPlayerProps[propId]) continue;

    deleteEntity(oldPlayerProps[propId]);
    propsPerPlayer[plyId][propId].deleted = true; // this object has been passed to createentity helper, by setting this we cancel the creation
    delete propsPerPlayer[plyId][propId];
  }

  for (const propId in newPlayerProps) {
    const newProp = newPlayerProps[propId];
    const oldProp = oldPlayerProps[propId];

    // check if prop in new exists in old, move if offset changed else do nothing
    if (oldProp) {
      if (Vector3.isSame(oldProp.offset, newProp.offset)) continue;

      // if already exists then move ent, if it doesnt exist the moving will happen because we changed the offset which will get used during creation
      if (oldProp.entity) {
        moveEntity(ped, oldProp.entity, newProp.name, newProp.offset);
      }
      propsPerPlayer[plyId][propId].offset = newProp.offset;
      continue;
    }

    // This object will get mutated when moving/entity has been created to we first create it before assiging it to propsperplayer
    // this is to fix when new items get created instantly and previous promise has not resolved
    const propData: PropAttach.ActiveProp = {
      ...newProp,
      entity: null,
      hash: GetHashKey(PROPS[newProp.name].model) >>> 0,
      deleted: false,
    };
    propsPerPlayer[plyId][propId] = propData;
    createEntity(ped, propData).then(entity => {
      if (!entity) return;
      propData.entity = entity;
    });
  }
};

export const deleteAllEntities = () => {
  for (const plyId in propsPerPlayer) {
    for (const propId in propsPerPlayer[plyId]) {
      deleteEntity(propsPerPlayer[plyId][propId]);
    }
  }
  propsPerPlayer = {};
};

export const startPropattachScopeThread = () => {
  setInterval(() => {
    for (const key in propsPerPlayer) {
      const plyId = Number(key);
      // returns -1 if player with serverid is out of scope
      if (GetPlayerFromServerId(plyId) !== -1) continue;

      for (const propId in propsPerPlayer[plyId]) {
        deleteEntity(propsPerPlayer[plyId][propId]);
      }

      delete propsPerPlayer[plyId];
    }
  }, 250);
};

export const handlePropattachModuleResourceStop = () => {
  deleteAllEntities();
  resetProps();
};
