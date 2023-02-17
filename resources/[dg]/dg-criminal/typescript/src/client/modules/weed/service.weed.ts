import { Util, Taskbar, Events, StaticObjects } from '@dgx/client/classes';

const weedPlantModels = new Set<number>();

export const registerWeedPlantModels = (models: string[]) => {
  for (const model of models) {
    weedPlantModels.add(GetHashKey(model) >>> 0);
  }
};

export const feedWeedPlant = async (weedPlantId: number, objectId: string) => {
  const entity = StaticObjects.getEntityForObjectId(objectId);
  if (!entity) return;

  const heading = Util.getHeadingToFaceEntity(entity);
  await Util.goToCoords({ ...Util.getPlyCoords(), w: heading });

  const [canceled] = await Taskbar.create('hand-holding-seedling', 'Voeden', 10000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'timetable@gardener@filling_can',
      anim: 'gar_ig_5_filling_can',
      flags: 16,
    },
  });
  if (canceled) return;

  Events.emitNet('criminal:weed:feed', weedPlantId);
};

export const destroyWeedPlant = async (weedPlantId: number, objectId: string) => {
  const entity = StaticObjects.getEntityForObjectId(objectId);
  if (!entity) return;

  const heading = Util.getHeadingToFaceEntity(entity);
  await Util.goToCoords({ ...Util.getPlyCoords(), w: heading });

  const [canceled] = await Taskbar.create('hammer-crash', 'Kapot maken', 10000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 0,
    },
  });
  if (canceled) return;

  Events.emitNet('criminal:weed:destroy', weedPlantId);
};

export const cutWeedPlant = async (weedPlantId: number, objectId: string) => {
  const entity = StaticObjects.getEntityForObjectId(objectId);
  if (!entity) return;

  const heading = Util.getHeadingToFaceEntity(entity);
  await Util.goToCoords({ ...Util.getPlyCoords(), w: heading });

  const [canceled] = await Taskbar.create('scissors', 'Knippen', 10000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 0,
    },
  });
  if (canceled) return;

  Events.emitNet('criminal:weed:cut', weedPlantId);
};

export const anyPlantInRange = (entity: number, targetCoords: Vec3) => {
  const objects: number[] = GetGamePool('CObject');
  for (const object of objects) {
    if (object === entity) continue;
    const model = GetEntityModel(object) >>> 0;
    if (!weedPlantModels.has(model)) continue;

    const coords = Util.getEntityCoords(object);
    if (coords.distance(targetCoords) < 2) {
      return true;
    }
  }
  return false;
};
