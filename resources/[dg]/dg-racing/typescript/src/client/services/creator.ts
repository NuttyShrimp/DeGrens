import { Events, Keys, Notifications, UI, Util } from '@dgx/client';
import { DEFAULT_CREATOR_OPTIONS, PILE_HASH_KEY } from 'constant';

import { clearBlips, showBlipsForCheckpoints } from './blips';
import { getCheckpointObjectCoords } from 'helpers/utils';

let creatingOptions = {
  ...DEFAULT_CREATOR_OPTIONS,
};
const entities = {
  left: 0,
  right: 0,
};

const setGhostBarrels = () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  if (!entities.left || !DoesEntityExist(entities.left)) {
    const leftOffset = GetOffsetFromEntityInWorldCoords(veh, 1, 0, 0);
    entities.left = CreateObject(PILE_HASH_KEY, leftOffset[0], leftOffset[1], leftOffset[2], false, true, false);
    SetEntityAlpha(entities.left, 160, true);
  }

  if (!entities.right || !DoesEntityExist(entities.right)) {
    const rightOffset = GetOffsetFromEntityInWorldCoords(veh, -1, 0, 0);
    entities.right = CreateObject(PILE_HASH_KEY, rightOffset[0], rightOffset[1], rightOffset[2], false, true, false);
    SetEntityAlpha(entities.right, 160, true);
  }

  AttachEntityToEntity(
    entities.left,
    veh,
    0,
    creatingOptions.spread,
    0,
    -0.5,
    0,
    0,
    0,
    true,
    true,
    false,
    false,
    2,
    true
  );
  SetEntityCompletelyDisableCollision(entities.left, false, true);
  AttachEntityToEntity(
    entities.right,
    veh,
    0,
    -1 * creatingOptions.spread,
    0,
    -0.5,
    0,
    0,
    0,
    true,
    true,
    false,
    false,
    2,
    true
  );
  SetEntityCompletelyDisableCollision(entities.right, false, true);
};

const deleteCheckpointEntities = (checkpoint: Racing.Checkpoint) => {
  if (!checkpoint.entities) return;
  for (const ent of Object.values(checkpoint.entities)) {
    if (DoesEntityExist(ent)) {
      DeleteEntity(ent);
    }
  }
};

const cleanupCheckpoints = () => {
  if (creatingOptions.checkpoints.length < 1) return;
  creatingOptions.checkpoints.forEach(deleteCheckpointEntities);
};

const placeCheckpointEntities = (checkpoint: Racing.Checkpoint) => {
  const [left, right] = getCheckpointObjectCoords(checkpoint.center, checkpoint.spread);
  checkpoint.entities = {
    left: CreateObject(PILE_HASH_KEY, left.x, left.y, left.z, false, true, false),
    right: CreateObject(PILE_HASH_KEY, right.x, right.y, right.z, false, true, false),
  };
  PlaceObjectOnGroundProperly(checkpoint.entities.left);
  PlaceObjectOnGroundProperly(checkpoint.entities.right);
};

export const creatingATrack = () => creatingOptions.enabled;

export const startTrackCreator = (id: number, checkpoints?: Racing.Checkpoint[]) => {
  const ped = PlayerPedId();
  if (!IsPedInAnyVehicle(ped, false)) {
    Notifications.add('Je kunt dit enkel in een voertuig doen');
    return;
  }
  clearBlips();

  creatingOptions.id = id;
  creatingOptions.enabled = true;
  UI.showInteraction(
    `[${Keys.getBindedKey('race-creator-exit')}] Stop | [${Keys.getBindedKey(
      'race-creator-finish'
    )}] Finish | [${Keys.getBindedKey('race-creator-remove')}] Remove | [${Keys.getBindedKey(
      'race-creator-undo'
    )}] Undo | [${Keys.getBindedKey('race-creator-place')}] Place | [${Keys.getBindedKey(
      'race-creator-spread-wider'
    )} - ${Keys.getBindedKey('race-creator-spread-smaller')}] wider/smaller`
  );

  if (checkpoints) {
    creatingOptions.checkpoints = checkpoints;
    for (const checkpoint of checkpoints) {
      placeCheckpointEntities(checkpoint);
    }
  }

  setGhostBarrels();
};

export const cancelTrackCreation = () => {
  creatingOptions = { ...DEFAULT_CREATOR_OPTIONS };
  clearBlips();
  for (const ent of Object.values(entities)) {
    if (DoesEntityExist(ent)) {
      DeleteEntity(ent);
    }
  }
  cleanupCheckpoints();
  UI.hideInteraction();
};

export const finishTrackCreation = () => {
  Events.emitNet(
    'racing:creator:finish',
    creatingOptions.id,
    creatingOptions.checkpoints.map(c => {
      delete c.entities;
      return c;
    })
  );
  cancelTrackCreation();
};

export const placeCheckpoint = () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);
  const heading = GetEntityHeading(veh);

  const checkpoint: Racing.Checkpoint = {
    center: { ...Util.getEntityCoords(veh), w: heading },
    spread: creatingOptions.spread,
  };
  placeCheckpointEntities(checkpoint);
  creatingOptions.checkpoints.push(checkpoint);

  showBlipsForCheckpoints(creatingOptions.checkpoints);
};

export const removeNearestCheckpoint = () => {
  const object = Util.getClosestObject(18, [entities.left, entities.right], PILE_HASH_KEY);
  if (!object) return;
  const checkpointIdx = creatingOptions.checkpoints.findIndex(
    c => c.entities && (c.entities.left === object || c.entities?.right === object)
  );
  if (checkpointIdx === -1) return;
  const checkpoint = creatingOptions.checkpoints[checkpointIdx];
  deleteCheckpointEntities(checkpoint);
  creatingOptions.checkpoints.splice(checkpointIdx, 1);

  showBlipsForCheckpoints(creatingOptions.checkpoints);
};

export const undoCheckpoint = () => {
  if (creatingOptions.checkpoints.length === 0) return;
  const checkpoint = creatingOptions.checkpoints.pop();

  if (checkpoint?.entities) {
    if (DoesEntityExist(checkpoint.entities.left)) {
      DeleteEntity(checkpoint.entities.left);
    }
    if (DoesEntityExist(checkpoint.entities.right)) {
      DeleteEntity(checkpoint.entities.right);
    }
  }

  showBlipsForCheckpoints(creatingOptions.checkpoints);
};

export const setSpread = (modifier: number) => {
  const clamped = Math.min(Math.max(2, modifier + creatingOptions.spread), 16);
  creatingOptions.spread = clamped;

  setGhostBarrels();
};
