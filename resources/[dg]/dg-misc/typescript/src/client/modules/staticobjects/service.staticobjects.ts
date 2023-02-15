import { Util } from '@dgx/client';

let currentId = 0;
const staticObjects: Record<string, StaticObjects.Active> = {};

// Ids of objs that only exist for client (ex house interior objs)
const localIds = new Set<string>();

const createStaticObject = async (data: StaticObjects.State) => {
  if (staticObjects[data.id]) {
    destroyStaticObject(data.id);
  }

  const modelHash = typeof data.model === 'string' ? GetHashKey(data.model) : data.model;
  await Util.loadModel(modelHash);

  const entity = CreateObjectNoOffset(modelHash, data.coords.x, data.coords.y, data.coords.z, false, false, false);
  if (data.rotation) {
    SetEntityRotation(entity, data.rotation.x, data.rotation.y, data.rotation.z, 0, true);
  } else if ('w' in data.coords) {
    SetEntityHeading(entity, data.coords.w);
  }
  FreezeEntityPosition(entity, true);

  const entState = Entity(entity).state;
  if (data.flags) {
    for (const [key, value] of Object.entries(data.flags)) {
      entState[key] = value;
    }
  }

  staticObjects[data.id] = { ...data, entity };

  await Util.Delay(10); // might prevent possible crash when creating lots of entities
};

const destroyStaticObject = (objId: string) => {
  const active = staticObjects[objId];
  if (!active) return;

  SetEntityAsMissionEntity(active.entity, true, true);
  DeleteEntity(active.entity);
  delete staticObjects[objId];
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

export const initiateStaticObjects = () => {
  const state: Record<string, StaticObjects.State> = GlobalState?.staticObjects;
  if (!state) return;
  handleStateUpdate(state);
};

export const handleStateUpdate = async (newObjects: Record<string, StaticObjects.State>) => {
  // Remove objects that exist in old but not in new
  for (const objId of Object.keys(staticObjects)) {
    if (objId in newObjects || localIds.has(objId)) continue;
    destroyStaticObject(objId);
  }

  // Add objects that are in new but not in old
  for (const [objId, data] of Object.entries(newObjects)) {
    if (objId in staticObjects) continue;
    await createStaticObject(data);
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
