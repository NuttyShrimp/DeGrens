import { Events, Util, UI, Taskbar, Peek, RayCast, Notifications, Weapons } from '@dgx/client/classes';
import { MODELS_PER_STAGE } from './constants.weed';
import {
  checkPlantStatus,
  cleanUpEntities,
  cutPlant,
  depleteFood,
  destroyPlant,
  feedPlant,
  getPlantIdFromEntity,
  isValidPlantLocation,
  registerPlant,
  removePlant,
  updatePlantMetadata,
} from './service.weed';

let isPlacing = false;

Events.onNet('criminal:weed:plant', async (itemId: string) => {
  if (isPlacing) {
    Notifications.add('Je bent al een plant aan het plaatsen', 'error');
    return;
  }

  UI.showInteraction('Spatie om te plaatsen');
  Weapons.showReticle(true);
  isPlacing = true;

  // Logic to select a valid location using raycasts, materials and display entity
  const plantCoords = await new Promise<Vec3>(async res => {
    const entity = CreateObject(MODELS_PER_STAGE[1], 0, 0, 0, false, false, false);
    await Util.awaitEntityExistence(entity);
    FreezeEntityPosition(entity, true);
    SetEntityAsMissionEntity(entity, true, true);
    SetEntityAlpha(entity, 204, true);
    SetEntityCompletelyDisableCollision(entity, false, false);

    const changeEntityPosition = (coords: Vec3) => {
      SetEntityCoords(entity, coords.x, coords.y, coords.z, false, false, false, false);
      PlaceObjectOnGroundProperly(entity);
      const newPos = Util.getEntityCoords(entity);
      SetEntityCoords(entity, newPos.x, newPos.y, newPos.z - 0.6, false, false, false, false);
    };

    const ped = PlayerPedId();
    const interval = setInterval(() => {
      const raycastCoords = RayCast.doRaycast().coords;
      if (!raycastCoords) {
        if (IsEntityVisible(entity)) {
          SetEntityVisible(entity, false, false);
        }
        return;
      }

      // Raycast coords should be in radius of this coord
      const radiusCoords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(ped, 0, 1, 0));
      if (radiusCoords.distance(raycastCoords) > 1.4) {
        if (IsEntityVisible(entity)) {
          SetEntityVisible(entity, false, false);
        }
        return;
      }

      changeEntityPosition(raycastCoords);
      const isValid = isValidPlantLocation(raycastCoords, entity);
      if (IsEntityVisible(entity) !== isValid) {
        SetEntityVisible(entity, isValid, false);
      }
      if (!isValid) return;

      if (IsControlJustPressed(0, 18)) {
        clearInterval(interval);
        res(Util.getEntityCoords(entity));
        DeleteEntity(entity);
      }
    }, 1);
  });

  UI.hideInteraction();
  Weapons.showReticle(false);
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
  Events.emitNet('criminal:weed:add', itemId, plantCoords);
});

Events.onNet('criminal:weed:register', registerPlant);
Events.onNet('criminal:weed:updatePlant', updatePlantMetadata);
Events.onNet('criminal:weed:remove', removePlant);
Events.onNet('criminal:weed:depleteFood', depleteFood);

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;
  cleanUpEntities();
});

Peek.addModelEntry(MODELS_PER_STAGE, {
  options: [
    {
      icon: 'fas fa-clipboard',
      label: 'Check Status',
      action: (_, entity) => {
        if (!entity) return;
        checkPlantStatus(entity);
      },
      canInteract: entity => {
        if (!entity) return false;
        return getPlantIdFromEntity(entity) !== undefined;
      },
    },
    {
      icon: 'fas fa-oil-can',
      label: 'Voed',
      items: 'plant_fertilizer',
      action: (_, entity) => {
        if (!entity) return;
        feedPlant(entity);
      },
      canInteract: entity => {
        if (!entity) return false;
        return getPlantIdFromEntity(entity) !== undefined;
      },
    },
    {
      icon: 'fas fa-axe',
      label: 'Maak kapot',
      action: (_, entity) => {
        if (!entity) return;
        destroyPlant(entity);
      },
      canInteract: entity => {
        if (!entity) return false;
        return getPlantIdFromEntity(entity) !== undefined;
      },
    },
  ],
  distance: 2,
});

Peek.addModelEntry(MODELS_PER_STAGE[MODELS_PER_STAGE.length - 1], {
  options: [
    {
      icon: 'fas fa-cut',
      label: 'Knip',
      action: (_, entity) => {
        if (!entity) return;
        cutPlant(entity);
      },
      canInteract: entity => {
        if (!entity) return false;
        return getPlantIdFromEntity(entity) !== undefined;
      },
    },
  ],
  distance: 2.0,
});
