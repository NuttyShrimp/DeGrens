let currentId = 0;
const staticObjects: Record<string, StaticObjects.State> = {};

export const initializeStaticObjects = () => {
  GlobalState.staticObjects = {};
};

const registerStaticObject = (data: StaticObjects.CreateData) => {
  const id = `staticobject_${currentId++}`;
  staticObjects[id] = { ...data, id };
  return id;
};

export const addStaticObject = (data: StaticObjects.CreateData | StaticObjects.CreateData[]): string[] => {
  const newIds: string[] = [];
  if (Array.isArray(data)) {
    for (const d of data) {
      const newId = registerStaticObject(d);
      newIds.push(newId);
    }
  } else {
    const newId = registerStaticObject(data);
    newIds.push(newId);
  }

  GlobalState.staticObjects = staticObjects;
  return newIds;
};

export const removeStaticObject = (objId: string | string[]) => {
  if (Array.isArray(objId)) {
    for (const id of objId) {
      delete staticObjects[id];
    }
  } else {
    delete staticObjects[objId];
  }

  GlobalState.staticObjects = staticObjects;
};
