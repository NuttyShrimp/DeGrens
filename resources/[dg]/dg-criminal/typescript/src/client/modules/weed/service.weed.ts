import { RPC, Util, UI, Notifications, Taskbar, Events } from '@dgx/client/classes';
import { Vector3 } from '@dgx/shared';
import { ACCEPTED_MATERIALS, MODELS_PER_STAGE } from './constants.weed';
import { lookAtPlant } from './helpers.weed';

let plants: Map<number, Criminal.Weed.Plant & { entity?: number }> = new Map();

export const registerPlant = (id: number, data: Criminal.Weed.Plant) => {
  plants.set(id, data);
};

export const removePlant = (id: number) => {
  destroyPlantEntity(id);
  plants.delete(id);
};

export const updatePlantMetadata = (id: number, data: Criminal.Weed.Plant['metadata']) => {
  const plant = plants.get(id);
  if (!plant) return;
  const stageChanged = plant.metadata.stage !== data.stage;
  plant.metadata = data;

  if (stageChanged) {
    destroyPlantEntity(id);
    createPlantEntity(id);
  }
};

export const isValidPlantLocation = (coords: Vec3, entity: number) => {
  const vec = Vector3.create(coords);
  if (Array.from(plants.values()).some(p => vec.distance(p.coords) < 1.5)) return false;

  const ped = PlayerPedId();
  if (IsEntityInWater(ped) || IsEntityInAir(ped)) return false;

  const handle = StartShapeTestCapsule(
    coords.x,
    coords.y,
    coords.z + 4,
    coords.x,
    coords.y,
    coords.z - 2,
    0.5,
    1,
    entity,
    7
  );
  const materialHash = GetShapeTestResultIncludingMaterial(handle)[4]; // fourth is material
  if (!materialHash) return false;
  return ACCEPTED_MATERIALS.has(materialHash);
};

export const cleanUpEntities = () => {
  Array.from(plants.values()).forEach(p => {
    if (!p.entity || !DoesEntityExist(p.entity)) return;
    DeleteEntity(p.entity);
  });
};

const createPlantEntity = async (id: number) => {
  const data = plants.get(id);
  if (!data) return;
  const model = MODELS_PER_STAGE[data.metadata.stage - 1] ?? 'bkr_prop_weed_01_small_01b';
  await Util.loadModel(model);

  const entity = CreateObject(model, data.coords.x, data.coords.y, data.coords.z, false, false, false);
  SetEntityVisible(entity, false, false);
  await Util.awaitEntityExistence(entity);
  PlaceObjectOnGroundProperly(entity);

  const coords = Util.getEntityCoords(entity);
  SetEntityCoords(entity, coords.x, coords.y, coords.z - 0.6, false, false, false, false);
  FreezeEntityPosition(entity, true);
  SetEntityAsMissionEntity(entity, true, true);
  SetEntityVisible(entity, true, false);

  Entity(entity).state.set('plantId', id, false);
  data.entity = entity;
};

const destroyPlantEntity = (id: number) => {
  const data = plants.get(id);
  if (!data) return;
  if (data.entity && DoesEntityExist(data.entity)) {
    DeleteEntity(data.entity);
  }
  delete data.entity;
};

export const startPlantsThread = () => {
  setInterval(async () => {
    const plyCoords = Util.getPlyCoords();

    for (const [i, p] of Array.from(plants)) {
      const id = Number(i);
      const distance = plyCoords.distance(p.coords);

      if (distance < 100 && !p.entity) {
        createPlantEntity(id);
        await Util.Delay(5);
      } else if (distance >= 100 && p.entity) {
        destroyPlantEntity(id);
        await Util.Delay(5);
      }
    }
  }, 1000);
};

export const getPlantIdFromEntity = (entity: number) => {
  return Entity(entity).state?.plantId ?? undefined;
};

export const checkPlantStatus = (entity: number) => {
  const id = getPlantIdFromEntity(entity);
  if (!id) return;
  const data = plants.get(id);
  if (!data) return;
  UI.openApplication('contextmenu', [
    {
      title: `Gender: ${data.gender === 'male' ? 'Mannelijk' : 'Vrouwelijk'}`,
    },
    {
      title: `Voedsel: ${data.metadata.food} percent`,
    },
  ]);
};

export const feedPlant = async (entity: number) => {
  const id = getPlantIdFromEntity(entity);
  if (!id) return;

  const data = plants.get(id);
  if (!data) return;
  if (data.metadata.food >= 100) {
    Notifications.add('Deze plant is al gevoed', 'error');
    return;
  }

  lookAtPlant(entity);
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

  Events.emitNet('criminal:weed:feed', id);
};

export const destroyPlant = async (entity: number) => {
  const id = getPlantIdFromEntity(entity);
  if (!id) return;

  lookAtPlant(entity);
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

  Events.emitNet('criminal:weed:destroy', id);
};

export const cutPlant = async (entity: number) => {
  const id = getPlantIdFromEntity(entity);
  if (!id) return;

  const canCut = await RPC.execute<boolean>('criminal:weed:canCut', id);
  if (!canCut) {
    Notifications.add('Deze plant is nog niet volgroeid', 'error');
    return;
  }

  lookAtPlant(entity);
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

  Events.emitNet('criminal:weed:cut', id);
};

export const depleteFood = () => {
  plants.forEach(p => p.metadata.food--);
};
