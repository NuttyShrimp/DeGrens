import { Events, SQL, Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import { eulerAnglesToRotMatrix } from '../../../shared/helpers/math';

const objectStore: Record<string, Objects.ServerState & { placer: string }> = {};
let objectId = 1;
let syncScheduler: NodeJS.Timeout | null = null;
let syncData: Objects.ServerState[] = [];

const rotMatrixToVecs = (matrix: number[]): Record<string, Vec3> => {
  return {
    right: {
      x: matrix[0],
      y: matrix[1],
      z: matrix[2],
    },
    forward: {
      x: matrix[4],
      y: matrix[5],
      z: matrix[6],
    },
    up: {
      x: matrix[8],
      y: matrix[9],
      z: matrix[10],
    },
  };
};

const scheduleSync = (data: Objects.ServerState[]) => {
  if (syncScheduler) {
    clearTimeout(syncScheduler);
  }
  syncData = syncData.concat(data);
  syncScheduler = setTimeout(() => {
    syncScheduler = null;
    Events.emitNet('dg-misc:objectmanager:addSynced', -1, syncData);
    syncData = [];
  }, 500);
};

export const seedObjectsToPlayer = (src: number) => {
  Events.emitNet('dg-misc:objectmanager:seedSynced', src, Object.values(objectStore));
};

export const loadDBObjects = async () => {
  const objects = await SQL.query<
    { id: number; placer: string; model: string; coords: string; flags: string; vectors: string }[]
  >('SELECT * FROM synced_objects ORDER BY id');
  objectId = (objects.at(-1)?.id ?? 0) + 1;
  objects.forEach(obj => {
    const id = `synced_${obj.id}`;
    const vecs = JSON.parse(obj.vectors);
    const coords = JSON.parse(obj.coords);
    objectStore[id] = {
      ...obj,
      coords,
      flags: JSON.parse(obj.flags),
      id,
      matrix: [
        vecs.right.x,
        vecs.right.y,
        vecs.right.z,
        0,
        vecs.forward.x,
        vecs.forward.y,
        vecs.forward.z,
        0,
        vecs.up.x,
        vecs.up.y,
        vecs.up.z,
        0,
        coords.x,
        coords.y,
        coords.z,
        1,
      ],
    };
  });
  seedObjectsToPlayer(-1);
};

export const addSyncedObject = async (objs: Objects.SyncedCreateData[], src?: number) => {
  if (objs.length < 1) return [];
  const newData: (Objects.ServerState & { placer: string })[] = [];
  for (const obj of objs) {
    const numId = objectId++;
    const id = `synced_${numId}`;
    const data: Objects.ServerState & { placer: string } = {
      id,
      coords: obj.coords,
      model: obj.model,
      flags: obj.flags,
      matrix: eulerAnglesToRotMatrix(obj.rotation, obj.coords),
      placer: src ? Player(src).state.steamId : 'script',
    };
    objectStore[id] = data;
    newData.push(data);
    if (!obj.skipStore) {
      await SQL.query(
        'INSERT INTO synced_objects (id, model, coords, vectors, flags, placer) VALUES (?, ?, ?, ?, ?, ?)',
        [
          numId,
          data.model,
          JSON.stringify(data.coords),
          JSON.stringify(rotMatrixToVecs(data.matrix)),
          JSON.stringify(data.flags ?? {}),
          data.placer,
        ]
      );
    }
  }
  scheduleSync(newData);
  if (src) {
    Util.Log('objects:addSynced', objs, `${newData[0].placer} has placed one or more synced object`, src);
  }
  return newData.map(d => d.id);
};

export const removeSyncedObject = async (objId: string | string[], src?: number) => {
  let objData: Objects.ServerState | Objects.ServerState[];
  let idToDel: number[];
  if (Array.isArray(objId)) {
    if (objId.length < 1) return;
    objData = [];
    for (const id of objId) {
      const obj = objectStore[id];
      if (!obj) continue;
      objData.push(obj);
      delete objectStore[id];
    }
    idToDel = objId.map(id => Number(id.replace(/synced_/, '')));
  } else {
    objData = objectStore[objId];
    if (!objData) return;
    delete objectStore[objId];
    idToDel = [Number(objId.replace(/synced_/, ''))];
  }
  if (src) {
    Util.Log(
      'objects:removeSynced',
      objData,
      `${Player(src).state.steamId} has removed one or more synced object(s)`,
      src
    );
  }
  await SQL.query(`DELETE FROM synced_objects WHERE id IN (${idToDel.map(() => '?').join(',')})`, idToDel);
  Events.emitNet('dg-misc:objectmanager:removeSynced', -1, objId);
  Events.emit('dg-misc:objectmanager:removeObject', objId);
};

export const updateSyncedObject = async (objId: string, matrix: number[], src?: number) => {
  const objData = objectStore[objId];
  if (!objData) return;
  const oldObjData = { ...objData };
  objData.matrix = matrix;
  objData.coords = new Vector3(matrix[12], matrix[13], matrix[14]);
  await SQL.query(`UPDATE synced_objects SET vectors = ?, coords = ? WHERE id = ?`, [
    JSON.stringify(rotMatrixToVecs(objData.matrix)),
    JSON.stringify(objData.coords),
    Number(objId.replace(`synced_`, '')),
  ]);
  Events.emitNet('dg-misc:objectmanager:updateSynced', -1, objId, objData);
  Events.emit('dg-misc:objectmanager:updateObject', objId, objData);
  if (!src) {
    return;
  }
  Util.Log(
    'objects:updateSynced',
    {
      objData,
      oldMatrix: oldObjData.matrix,
      oldCoords: oldObjData.coords,
    },
    `${Player(src).state.steamId} has moved an synced object`,
    src
  );
};
