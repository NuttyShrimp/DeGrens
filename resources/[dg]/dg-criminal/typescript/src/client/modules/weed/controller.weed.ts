import { Events, Util, UI, Taskbar, Peek, RayCast, Notifications, Weapons, StaticObjects } from '@dgx/client/classes';
import { ACCEPTED_MATERIALS } from './constants.weed';
import {
  anyPlantInRange,
  cutWeedPlant,
  destroyWeedPlant,
  feedWeedPlant,
  registerWeedPlantModels,
} from './service.weed';

let isPlacing = false;

Events.onNet('criminal:weed:setModels', registerWeedPlantModels);

Events.onNet('criminal:weed:plant', async (itemId: string, model: string) => {
  if (isPlacing) {
    Notifications.add('Je bent al een plant aan het plaatsen', 'error');
    return;
  }

  UI.showInteraction('Spatie om te plaatsen');
  Weapons.showReticle(true);
  isPlacing = true;

  // Logic to select a valid location using raycasts, materials and display entity
  const [isValid, plantCoords, plantRotation] = await new Promise<[boolean, Vec3, Vec3]>(async res => {
    const modelHash = GetHashKey(model);
    await Util.loadModel(modelHash);
    const entity = CreateObject(modelHash, 0, 0, 0, false, false, false);
    await Util.awaitEntityExistence(entity);
    FreezeEntityPosition(entity, true);
    SetEntityAsMissionEntity(entity, true, true);
    SetEntityCompletelyDisableCollision(entity, false, false);

    const changeEntityPosition = (coords: Vec3) => {
      SetEntityCoords(entity, coords.x, coords.y, coords.z, false, false, false, false);
      PlaceObjectOnGroundProperly(entity);
      const newPos = Util.getEntityCoords(entity);
      SetEntityCoords(entity, newPos.x, newPos.y, newPos.z - 0.6, false, false, false, false);
    };

    const ped = PlayerPedId();
    const interval = setInterval(() => {
      const raycastCoords = RayCast.doRaycast(10, -1, entity).coords;
      if (!raycastCoords) {
        if (IsEntityVisible(entity)) {
          SetEntityVisible(entity, false, false);
        }
        return;
      }

      changeEntityPosition(raycastCoords);

      const inDistance = Util.getPlyCoords().distance(raycastCoords) < 2;
      const isValidPedLocation = !IsEntityInWater(ped) && !IsEntityInAir(ped);
      const isValidMaterial = ACCEPTED_MATERIALS.has(Util.getGroundMaterial(raycastCoords, entity));
      const plantInRange = anyPlantInRange(entity, raycastCoords);

      const isValidLocation = inDistance && isValidPedLocation && isValidMaterial && !plantInRange;
      if (!!IsEntityVisible(entity) !== isValidLocation) {
        SetEntityVisible(entity, isValidLocation, false);
      }

      if (IsControlJustPressed(0, 18)) {
        clearInterval(interval);
        const coords = Util.getEntityCoords(entity);
        const rotation = Util.getEntityRotation(entity);
        res([isValidLocation, coords, rotation]);
        DeleteEntity(entity);
      }
    }, 1);
  });

  UI.hideInteraction();
  Weapons.showReticle(false);

  if (!isValid) {
    isPlacing = false;
    Notifications.add('Hier kan je dit niet planten', 'error');
    return;
  }

  const plyHeading = Util.getHeadingToFaceCoords(plantCoords);
  const targetCoords = Util.getOffsetFromCoords({ ...plantCoords, w: plyHeading }, { x: 0, y: -0.5, z: 0 });
  await Util.goToCoords({ ...targetCoords, w: plyHeading }, 2000);

  const [canceled] = await Taskbar.create('shovel', 'Planten', 10000, {
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
      animDict: 'amb@world_human_gardener_plant@male@base',
      anim: 'base',
      flags: 1,
    },
  });

  isPlacing = false;
  if (canceled) return;

  Events.emitNet('criminal:weed:add', itemId, plantCoords, plantRotation);
});

Peek.addFlagEntry('weedPlantId', {
  options: [
    {
      label: 'Bekijk Plant',
      icon: 'fas fa-cannabis',
      action: (_, entity) => {
        if (!entity) return;
        const weedPlantId = StaticObjects.getState<{ weedPlantId: number }>(entity)?.weedPlantId;
        if (!weedPlantId) return;
        Events.emitNet('criminal:weed:viewPlant', weedPlantId);
      },
    },
  ],
});

UI.RegisterUICallback('criminal/weed/feed', (data: { plantId: number; objectId: string; deluxe: boolean }, cb) => {
  feedWeedPlant(data.plantId, data.objectId, data.deluxe);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('criminal/weed/destroy', (data: { plantId: number; objectId: string }, cb) => {
  destroyWeedPlant(data.plantId, data.objectId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('criminal/weed/cut', (data: { plantId: number; objectId: string }, cb) => {
  cutWeedPlant(data.plantId, data.objectId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
