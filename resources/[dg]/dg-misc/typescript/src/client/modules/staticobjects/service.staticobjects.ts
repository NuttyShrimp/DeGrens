import { Util } from '@dgx/client';

let currentId = 0;
const staticObjects: Record<string, StaticObjects.Active> = {};

const staticObjectState = new Map<number, Record<string, any>>();

// Ids of objs that only exist for client (ex house interior objs)
const localIds = new Set<string>();

const createStaticObject = async (data: StaticObjects.State) => {
  if (staticObjects[data.id]) {
    destroyStaticObject(data.id);
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

  if (data.rotation) {
    SetEntityRotation(entity, data.rotation.x, data.rotation.y, data.rotation.z, 0, true);
  } else if ('w' in data.coords) {
    SetEntityHeading(entity, data.coords.w);
  }
  FreezeEntityPosition(entity, true);

  if (data.flags) {
    staticObjectState.set(entity, data.flags);
  }

  staticObjects[data.id] = { ...data, entity };

  await Util.Delay(50); // might prevent possible crash when creating lots of entities
};

const destroyStaticObject = (objId: string) => {
  const active = staticObjects[objId];
  if (!active) return;

  SetEntityAsMissionEntity(active.entity, true, true);
  DeleteEntity(active.entity);
  delete staticObjects[objId];
  staticObjectState.delete(active.entity);
};

const registerLocalStaticObject = async (data: StaticObjects.CreateData) => {
  const id = `staticobject_local_${currentId++}`;
  await createStaticObject({ ...data, id });
  localIds.add(id);
  return id;
};

const unregisterLocalStaticObject = (objId: string) => {
  if (!localIds.has(objId)) return;
  destroyStaticObject(objId);
  localIds.delete(objId);
};

export const addLocalStaticObject = async (data: StaticObjects.CreateData | StaticObjects.CreateData[]) => {
  const newIds: string[] = [];
  if (Array.isArray(data)) {
    for (const d of data) {
      const newId = await registerLocalStaticObject(d);
      newIds.push(newId);
    }
  } else {
    const newId = await registerLocalStaticObject(data);
    newIds.push(newId);
  }

  return newIds;
};

export const removeLocalStaticObject = (objId: string | string[]) => {
  if (Array.isArray(objId)) {
    for (const id of objId) {
      unregisterLocalStaticObject(id);
    }
    return;
  } else {
    unregisterLocalStaticObject(objId);
  }
};

export const handleGlobalAddAction = async (objects: StaticObjects.State[]) => {
  for (const object of objects) {
    await createStaticObject(object);
  }
};

export const handleGlobalRemoveAction = (objId: string | string[]) => {
  if (Array.isArray(objId)) {
    objId.forEach(destroyStaticObject);
  } else {
    destroyStaticObject(objId);
  }
};

// Used on resource stop
export const cleanupStaticObjects = () => {
  for (const objId of Object.keys(staticObjects)) {
    destroyStaticObject(objId);
  }
};

export const getEntityForObjectId = (objectId: string) => {
  return staticObjects[objectId]?.entity;
};

export const logAllToConsole = () => {
  console.log(staticObjects);
};

export const getStaticObjectState = (entity: number) => {
  return staticObjectState.get(entity);
};
