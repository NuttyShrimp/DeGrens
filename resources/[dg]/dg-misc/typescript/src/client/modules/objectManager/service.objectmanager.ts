import { Events, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { getChunkForPos, getMaxChunks } from '../../../shared/helpers/grid';
import { eulerAnglesToRotMatrix, rotMatrixToEulerAngles } from '../../../shared/helpers/math';
import { CHUNK_SIZE, neighbourMods } from './helper.objectmanager';

const objectStore: Record<string, Objects.ActiveState> = {};
// Set of all ids that are registered on client
const localObjects: Set<string> = new Set();
// Chunk to ObjectId
const chunkMap: Record<number, string[]> = {};
let checkThread: NodeJS.Timer | null = null;
let objId = 1;
let gizmoTick: number = 0;
let cursorEnabled = false;

const applyMatrix = (ent: number, matrix: Float32Array) => {
  SetEntityMatrix(
    ent,
    matrix[0],
    matrix[1],
    matrix[2],
    matrix[4],
    matrix[5],
    matrix[6],
    matrix[8],
    matrix[9],
    matrix[10],
    matrix[12],
    matrix[13],
    matrix[14]
  );
};

const applyMatrixByEuler = (ent: number, matrix: Float32Array) => {
  const eulerRot = rotMatrixToEulerAngles(matrix);
  SetEntityMatrix(ent, 1, 0, 0, 0, 1, 0, 0, 0, 1, matrix[12], matrix[13], matrix[14]);
  SetEntityRotation(ent, eulerRot.x, eulerRot.y, eulerRot.z, 0, true);
};

const createObject = async (id: string) => {
  const data = objectStore[id];
  if (!data) return;
  if (objectStore[data.id]?.entity) {
    return;
  }

  const modelHash = typeof data.model === 'string' ? GetHashKey(data.model) : data.model;
  if (!HasModelLoaded(modelHash)) {
    await Util.loadModel(modelHash);
  }

  const entity = CreateObjectNoOffset(modelHash, data.coords.x, data.coords.y, data.coords.z, false, false, false);
  if (!DoesEntityExist(entity)) {
    console.log(`Failed to create entity ${data.id}`);
    return;
  }

  applyMatrixByEuler(entity, data.matrix);
  FreezeEntityPosition(entity, true);

  Entity(entity).state.set('objId', id, false);
  if (data.flags) {
    for (const [key, value] of Object.entries(data.flags)) {
      Entity(entity).state.set(key, value, false);
    }
  }
  objectStore[data.id].entity = entity;

  await Util.Delay(50); // might prevent possible crash when creating lots of entities
};

const destroyObject = (id: string) => {
  const entityId = objectStore[id]?.entity;
  if (!entityId) {
    return;
  }

  DeleteEntity(entityId);
  objectStore[id].entity = undefined;
};

const spawnChunks = (ids: number[]) => {
  if (ids.length < 1) return;
  for (let chunkId of ids) {
    if (!chunkMap[chunkId]) continue;
    for (let objId of chunkMap[chunkId]) {
      createObject(objId);
    }
  }
};

const cleanupChunks = (ids: number[]) => {
  if (ids.length < 1) return;
  for (let chunkId of ids) {
    if (!chunkMap[chunkId]) continue;
    for (let objId of chunkMap[chunkId]) {
      destroyObject(objId);
    }
  }
};

const registerObject = (data: Objects.CreateState) => {
  const objChunk = getChunkForPos(data.coords, CHUNK_SIZE);
  if (!chunkMap[objChunk]) {
    chunkMap[objChunk] = [];
  }
  chunkMap[objChunk].push(data.id);
  objectStore[data.id] = { ...data, chunk: objChunk };
};

export const addLocalObject = (data: Objects.CreateData | Objects.CreateData[]) => {
  let createdIds: string[] = [];
  if (Array.isArray(data)) {
    for (let obj of data) {
      const id = `local_${objId++}`;
      createdIds.push(id);
      if (!obj.rotation) {
        obj.rotation = new Vector3(0, 0, 0);
      }
      const matrix = new Float32Array(eulerAnglesToRotMatrix(obj.rotation, obj.coords));
      delete obj.rotation;
      registerObject({ ...obj, id, matrix });
    }
  } else {
    const id = `local_${objId++}`;
    createdIds.push(id);
    if (!data.rotation) {
      data.rotation = new Vector3(0, 0, 0);
    }
    const matrix = new Float32Array(eulerAnglesToRotMatrix(data.rotation, data.coords));
    delete data.rotation;
    registerObject({ ...data, id, matrix });
  }
  if (checkThread) {
    checkThread.refresh();
  }
  createdIds.forEach(localObjects.add);
  return createdIds;
};

export const addSyncedObject = (data: Objects.CreateState[]) => {
  if (data.length < 1) return;
  for (let obj of data) {
    if (!obj.flags) {
      obj.flags = {};
    }
    obj.flags['isSynced'] = true;
    obj.matrix = new Float32Array([...obj.matrix.values()]);
    registerObject(obj);
  }
  if (checkThread) {
    checkThread.refresh();
  }
};

export const removeObject = async (ids: string | string[]) => {
  if (Array.isArray(ids)) {
    if (ids.length < 1) return;
    const chunksToCheck = new Set<number>();
    for (let id of ids) {
      const data = objectStore[id];
      if (!data) continue;
      chunksToCheck.add(data.chunk);
      if (data.entity) {
        DeleteEntity(data.entity);
        await Util.Delay(50);
      }
      delete objectStore[id];
    }
    chunksToCheck.forEach(chunk => {
      if (!chunkMap[chunk]) {
        return;
      }
      chunkMap[chunk] = chunkMap[chunk].filter(id => !ids.includes(id));
    });
  } else {
    const data = objectStore[ids];
    if (!data) return;
    if (data.entity) {
      DeleteEntity(data.entity);
    }
    chunkMap[data.chunk] = chunkMap[data.chunk].filter(id => ids !== id);
    delete objectStore[ids];
  }
  if (checkThread) {
    checkThread.refresh();
  }
};

export const scheduleChunkCheck = () => {
  if (checkThread) {
    clearInterval(checkThread);
    checkThread = null;
  }
  let pos = Util.getPlyCoords();
  let visibleChunks = new Set<number>();
  let oldVisChunks = new Set<number>();
  checkThread = setInterval(() => {
    pos = Util.getPlyCoords();
    oldVisChunks = new Set(visibleChunks);
    visibleChunks = new Set();
    neighbourMods.forEach(({ x: modX, y: modY }) => {
      const chunkId = Util.getChunkForPos({ x: pos.x + modX, y: pos.y + modY }, CHUNK_SIZE);
      visibleChunks.add(chunkId);
      oldVisChunks.delete(chunkId);
    });
    cleanupChunks([...oldVisChunks.values()]);
    spawnChunks([...visibleChunks.values()]);
  }, 1000);
};

export const cleanupObjects = () => {
  if (checkThread) {
    clearInterval(checkThread);
    checkThread = null;
  }
  cleanupChunks(new Array(getMaxChunks(CHUNK_SIZE)).fill(1).map((_, idx) => idx));
};

export const updateSyncedObject = (objId: string, data: Objects.CreateState) => {
  const objData = objectStore[objId];
  if (!objData) {
    addSyncedObject([data]);
    return;
  }
  objData.matrix = data.matrix;
  objData.coords = data.coords;
  const objChunk = getChunkForPos(data.coords, CHUNK_SIZE);
  if (objChunk !== objData.chunk) {
    if (!chunkMap[objChunk]) {
      chunkMap[objChunk] = [];
    }
    chunkMap[objChunk].push(data.id);
    chunkMap[objData.chunk] = chunkMap[objData.chunk].filter(id => id !== objId);
    objData.chunk = objChunk;
  }
  if (objData.entity) {
    applyMatrixByEuler(objData.entity, objData.matrix);
  }
};

export const getEntityForObjectId = (objId: string) => {
  return objectStore[objId]?.entity;
};

export const startObjectGizmo = (objId: string) => {
  const objData = objectStore[objId];
  if (!objData || !objData.entity) return;
  if (gizmoTick) {
    clearTick(gizmoTick);
  }
  EnterCursorMode();
  cursorEnabled = true;
  let wasFreezed = IsEntityPositionFrozen(objData.entity);
  FreezeEntityPosition(objData.entity, false);
  gizmoTick = setTick(() => {
    if (!objData || !objData.entity || IsControlPressed(0, 202)) {
      LeaveCursorMode();
      cursorEnabled = false;
      if (gizmoTick) {
        clearTick(gizmoTick);
        gizmoTick = 0;
      }
      if (wasFreezed && objData.entity) {
        FreezeEntityPosition(objData.entity, true);
      }
      Events.emitNet('dg-misc:objectmanager:updateSyncedObject', objId, Array.prototype.slice.call(objData.matrix));
      return;
    }
    // @ts-ignore
    DrawGizmo(objData.matrix, objId);
    applyMatrix(objData.entity, objData.matrix);
    DisableControlAction(0, 24, true);
  });
};

RegisterCommand(
  'misc:object:toggleCursor',
  () => {
    if (!cursorEnabled) {
      EnterCursorMode();
    } else {
      LeaveCursorMode();
    }
    cursorEnabled = !cursorEnabled;
  },
  false
);

export const handleObjectManagerModuleResourceStop = () => {
  cleanupObjects();
};
