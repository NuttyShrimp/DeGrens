let currentId = 0;
const staticObjects: Record<string, StaticObjects.State> = {};

const registerStaticObject = (data: StaticObjects.CreateData): StaticObjects.State => {
  const id = `staticobject_${currentId++}`;
  const state: StaticObjects.State = { ...data, id };
  staticObjects[id] = state;
  return state;
};

export const addStaticObject = (data: StaticObjects.CreateData | StaticObjects.CreateData[]): string[] => {
  const objects: StaticObjects.State[] = [];
  if (Array.isArray(data)) {
    for (const d of data) {
      const object = registerStaticObject(d);
      objects.push(object);
    }
  } else {
    const object = registerStaticObject(data);
    objects.push(object);
  }

  emitNet('misc:staticObjects:add', -1, objects);
  return objects.map(o => o.id);
};

export const removeStaticObject = (objId: string | string[]) => {
  if (Array.isArray(objId)) {
    for (const id of objId) {
      delete staticObjects[id];
    }
  } else {
    delete staticObjects[objId];
  }

  emitNet('misc:staticObjects:remove', -1, objId);
};

export const syncStaticObjectsToClient = (plyId: number) => {
  emitNet('misc:staticObjects:add', plyId, Object.values(staticObjects));
};

export const logAllToConsole = () => {
  console.log(staticObjects);
};
