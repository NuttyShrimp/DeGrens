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
  attachedProps[currentId] = {
    name,
    offset,
  };
  updateState();

  return currentId;
};

export const removeProp = (propId: number) => {
  const activeProp = attachedProps[propId];
  if (!activeProp) {
    debug(`Tried to remove prop ${propId} but was not an attached prop`);
    return;
  }

  delete attachedProps[propId];
  updateState();
};

export const moveProp = (propId: number, position: Vec3) => {
  const activeProp = attachedProps[propId];
  if (!activeProp) {
    debug(`Tried to move prop ${propId} but was not an attached prop`);
    return;
  }

  activeProp.offset = position;
  updateState();
};

export const handlePlayerStateUpdate = (plyId: number, newPlayerProps: Record<number, PropAttach.ActiveProp>) => {
  const ped = GetPlayerPed(GetPlayerFromServerId(plyId));

  // first remove old props that are no longer in new state
  const oldPlayerProps = (propsPerPlayer[plyId] ??= {});
  for (const key of Object.keys(oldPlayerProps)) {
    const propId = Number(key);
    if (newPlayerProps[propId]) continue;

    deleteEntity(oldPlayerProps[propId].entity);
    delete propsPerPlayer[plyId][propId];
  }

  for (const propId in newPlayerProps) {
    const newProp = newPlayerProps[propId];
    const oldProp = oldPlayerProps[propId];

    // check if prop in new exists in old, move if offset changed else do nothing
    if (oldProp) {
      if (Vector3.isSame(oldProp.offset, newProp.offset)) continue;

      moveEntity(ped, oldProp.entity, newProp.name, newProp.offset);
      propsPerPlayer[plyId][propId].offset = newProp.offset;
      continue;
    }

    const entity = createEntity(ped, newProp.name, newProp.offset);
    if (entity) {
      propsPerPlayer[plyId][propId] = { ...newProp, entity };
    }
  }
};

export const resetProps = () => {
  attachedProps = {};
  updateState();
};

export const toggleProps = (toggle: boolean) => {
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

export const deleteAllEntities = () => {
  for (const plyId in propsPerPlayer) {
    for (const propId in propsPerPlayer[plyId]) {
      deleteEntity(propsPerPlayer[plyId][propId].entity);
    }
  }
  propsPerPlayer = {};
};

export const startPropattachScopeThread = () => {
  // preload all possible prop models
  for (const name in PROPS) {
    RequestModel(PROPS[name].model);
  }

  setInterval(() => {
    for (const key in propsPerPlayer) {
      const plyId = Number(key);
      // returns -1 if player with serverid is out of scope
      if (GetPlayerFromServerId(plyId) !== -1) continue;

      for (const propId in propsPerPlayer[plyId]) {
        deleteEntity(propsPerPlayer[plyId][propId].entity);
      }

      delete propsPerPlayer[plyId];
    }
  }, 250);
};
