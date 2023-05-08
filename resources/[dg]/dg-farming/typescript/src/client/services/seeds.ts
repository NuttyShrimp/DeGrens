import { Notifications, Weapons, Util, Taskbar, UI, RayCast } from '@dgx/client';
import { ALLOWED_MATERIALS } from '../constants';
import { isInFarmingZone } from './zones';

const plantModels = new Set<number>();
let isPlacing = false;

export const setPlantModels = (models: number[]) => {
  for (const model of models) {
    plantModels.add(model);
  }
};

export const findSeedCoords = async (entityModel: string, zOffset: number) => {
  if (isPlacing) {
    Notifications.add('Je bent al een plant aan het plaatsen', 'error');
    return;
  }

  if (!isInFarmingZone()) {
    Notifications.add('Je bent niet op een veld', 'error');
    return;
  }

  UI.showInteraction('Spatie om te plaatsen');
  Weapons.showReticle(true);
  isPlacing = true;

  // Logic to select a valid location using raycasts, materials and display entity
  const [isValid, plantCoords] = await new Promise<[boolean, Vec3]>(async res => {
    const modelHash = GetHashKey(entityModel);
    await Util.loadModel(modelHash);
    const entity = CreateObject(modelHash, 0, 0, 0, false, false, false);
    await Util.awaitEntityExistence(entity);
    FreezeEntityPosition(entity, true);
    SetEntityAsMissionEntity(entity, true, true);
    SetEntityAlpha(entity, 204, true);
    SetEntityCompletelyDisableCollision(entity, false, false);

    const ped = PlayerPedId();
    const interval = setInterval(() => {
      const raycastCoords = RayCast.doRaycast(10, -1, entity).coords;
      if (!raycastCoords) {
        if (IsEntityVisible(entity)) {
          SetEntityVisible(entity, false, false);
        }
        return;
      }

      SetEntityCoords(entity, raycastCoords.x, raycastCoords.y, raycastCoords.z + zOffset, false, false, false, false);

      const inZone = isInFarmingZone();
      const inDistance = Util.getPlyCoords().distance(raycastCoords) < 2;
      const isValidPedLocation = !IsEntityInWater(ped) && !IsEntityInAir(ped);
      const isValidMaterial = ALLOWED_MATERIALS.has(Util.getGroundMaterial(raycastCoords, entity));
      const plantInRange = anyPlantInRange(entity, raycastCoords);

      const isValidLocation = inDistance && isValidPedLocation && inZone && isValidMaterial && !plantInRange;
      if (!!IsEntityVisible(entity) !== isValidLocation) {
        SetEntityVisible(entity, isValidLocation, false);
      }

      if (IsControlJustPressed(0, 18)) {
        clearInterval(interval);
        res([isValidLocation, raycastCoords]);
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

  const [canceled] = await Taskbar.create('shovel', 'Planten', 4000, {
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

  return plantCoords;
};

const anyPlantInRange = (entity: number, targetCoords: Vec3) => {
  const objects: number[] = GetGamePool('CObject');
  for (const object of objects) {
    if (object === entity) continue;
    const model = GetEntityModel(object) >>> 0;
    if (!plantModels.has(model)) continue;

    const coords = Util.getEntityCoords(object);
    if (coords.distance(targetCoords) < 2) {
      return true;
    }
  }
  return false;
};
