import { Keys, RayCast, UI, Util } from '@dgx/client';
import { Thread, Vector3 } from '@dgx/shared';

let ghostEnt: number | null = null;
let raycastCoords: Vec3 | null = null;
let placeTick: number | null = null;
let rotation: number = 0;
let groundObject: boolean = true;
let resolver: ((res: { coords: Vec3; rot: Vec3 } | null) => void) | null = null;

let ghostThread: Thread = new Thread(
  () => {
    const entity = ghostThread.data.entity;
    const ped = PlayerPedId();
    const raycastCoords = RayCast.doRaycast(ghostThread?.data.maxDistance * 2, -1, entity).coords;
    const offset: Vec3 | undefined = ghostThread.data.offset;
    if (!raycastCoords) {
      if (IsEntityVisible(entity)) {
        SetEntityVisible(entity, false, false);
      }
      return;
    }

    SetEntityCoords(
      ghostThread.data.entity,
      raycastCoords.x,
      raycastCoords.y,
      raycastCoords.z,
      false,
      false,
      false,
      false
    );
    PlaceObjectOnGroundProperly(ghostThread.data.entity);
    const newPos = Util.getEntityCoords(ghostThread.data.entity);
    SetEntityCoords(
      ghostThread.data.entity,
      newPos.x + (offset?.x ?? 0),
      newPos.y + (offset?.y ?? 0),
      newPos.z + (offset?.z ?? 0),
      false,
      false,
      false,
      false
    );

    const inDistance = Util.getPlyCoords().distance(raycastCoords) < ghostThread?.data.maxDistance;
    const isValidPedLocation = !IsEntityInWater(ped) && !IsEntityInAir(ped);
    const isValidMaterial = ghostThread?.data.acceptedMaterials
      ? ghostThread?.data.acceptedMaterials.includes(Util.getGroundMaterial(raycastCoords, entity))
      : true;

    if (ghostThread.data.rotation) {
      const rot = GetEntityRotation(entity, 2);
      SetEntityRotation(entity, rot[0], rot[1], rot[2] + ghostThread.data.rotation, 2, true);
      ghostThread.data.rotation = 0;
    }

    const isValidLocation = inDistance && isValidPedLocation && isValidMaterial;
    if (!!IsEntityVisible(entity) !== isValidLocation) {
      SetEntityVisible(entity, isValidLocation, false);
      ghostThread!.data.validLocation = isValidLocation;
    }

    if (IsControlJustPressed(0, 200)) {
      ghostThread.stop();
      DeleteEntity(ghostThread.data.entity);
    }
  },
  0,
  'tick'
);

ghostThread.addHook('preStart', () => {
  ghostThread.data.validLocation = true;
});

const createGhostObject = (model: string) => {
  const playerPos = Util.getPlyCoords();
  ghostEnt = CreateObject(GetHashKey(model), playerPos.x, playerPos.y, playerPos.z, false, false, false);
  FreezeEntityPosition(ghostEnt, true);
  SetEntityAsMissionEntity(ghostEnt, true, true);
  SetEntityAlpha(ghostEnt, 200, false);
  SetEntityCompletelyDisableCollision(ghostEnt, true, true);
  SetEntityCollision(ghostEnt, false, false);
};

const cameraForwardVector = () => {
  const rot = Util.ArrayToVector3(GetGameplayCamRot(0)).multiply(Math.PI / 180);
  return new Vector3(
    -Math.sin(rot.z) * Math.abs(Math.cos(rot.x)),
    Math.cos(rot.z) * Math.abs(Math.cos(rot.x)),
    Math.sin(rot.x)
  );
};

const updateGhostPosition = () => {
  if (!ghostEnt) return;
  const camCoords = Util.ArrayToVector3(GetGameplayCamCoord());
  const targetCoords = camCoords.add(cameraForwardVector().multiply(10));
  const shapeTest = StartExpensiveSynchronousShapeTestLosProbe(
    camCoords.x,
    camCoords.y,
    camCoords.z,
    targetCoords.x,
    targetCoords.y,
    targetCoords.z - 1.5,
    1 + 16 + 32 + 64 + 128,
    ghostEnt,
    4
  );
  const [rtnVal, hit, endCoords, surfaceNormal, entityHit] = GetShapeTestResult(shapeTest);
  const hitCoords = Util.ArrayToVector3(endCoords);
  if (hit > 0) {
    SetEntityAlpha(ghostEnt, 200, false);
    raycastCoords = hitCoords;
  }
};

const positionGhostObject = () => {
  updateGhostPosition();
  if (raycastCoords && ghostEnt) {
    SetEntityCoords(ghostEnt, raycastCoords.x, raycastCoords.y, raycastCoords.z, false, false, false, false);
    SetEntityRotation(ghostEnt, 0.0, 0.0, rotation, 2, false);
    if (groundObject) {
      PlaceObjectOnGroundProperly(ghostEnt);
    }
  }
};

const cleanupPlacer = () => {
  if (ghostEnt) {
    DeleteEntity(ghostEnt);
    ghostEnt = null;
  }
  if (placeTick) {
    clearTick(placeTick);
    placeTick = null;
  }
  if (resolver) {
    resolver(null);
    resolver = null;
  }
  rotation = 0;
  groundObject = true;
  UI.hideInteraction();
};

export const startGizmoPlacement = async (model: string): Promise<{ coords: Vec3; rot: Vec3 } | null> => {
  if (resolver) {
    resolver(null);
  }
  model = model.trim();
  const modelHash = GetHashKey(model);
  await Util.loadModel(modelHash);
  if (!HasModelLoaded(modelHash)) {
    console.log(`Failed to start placement for ${model} because the model was not loaded`);
    return null;
  }
  createGhostObject(model);
  UI.showInteraction(
    `[${Keys.getBindedKey('+GeneralUse')}] - Plaats | [${Keys.getBindedKey(
      '+object-toggle-ground'
    )}] - Toggle Ground | [${Keys.getBindedKey('+INPUT_FRONTEND_CANCEL')}] - Cancel`
  );
  placeTick = setTick(() => {
    if (!ghostEnt) {
      cleanupPlacer();
      return;
    }
    if (IsControlPressed(0, 14)) {
      if (IsControlPressed(0, 21)) {
        rotation++;
      } else {
        rotation += 15;
      }
    }
    if (IsControlPressed(0, 15)) {
      if (IsControlPressed(0, 21)) {
        rotation--;
      } else {
        rotation -= 15;
      }
    }
    if (IsControlJustPressed(0, 202)) {
      if (resolver) {
        resolver(null);
      }
    }
    positionGhostObject();
  });
  return new Promise(res => {
    resolver = (v: { coords: Vec3; rot: Vec3 } | null) => {
      resolver = null;
      res(v);
      cleanupPlacer();
    };
  });
};

const createGhostThread = async (model: string, maxDistance = 5, acceptedMaterials?: string[], offset?: Vec3) => {
  const modelHash = GetHashKey(model);
  await Util.loadModel(modelHash);
  const entity = CreateObject(modelHash, 0, 0, 0, false, false, false);
  await Util.awaitEntityExistence(entity);
  FreezeEntityPosition(entity, true);
  SetEntityAsMissionEntity(entity, true, true);
  SetEntityCompletelyDisableCollision(entity, false, false);

  ghostThread.data.model = model;
  ghostThread.data.entity = entity;
  ghostThread.data.maxDistance = maxDistance;
  ghostThread.data.acceptedMaterials = acceptedMaterials;
  ghostThread.data.rotation = 0;
  ghostThread.data.offset = offset;
  ghostThread.start();
};

export const startGhostPlacement = async (
  model: string,
  maxDistance = 5,
  acceptedMaterials?: string[],
  offset?: Vec3
): Promise<{ coords: Vec3; rotation: Vec3 } | null> => {
  createGhostThread(model, maxDistance, acceptedMaterials, offset);

  const promise = new Promise<{ coords: Vec3; rotation: Vec3 } | null>(res => {
    if (!ghostThread) {
      throw new Error('Ghost thread not created');
    }
    ghostThread.data.res = res;
  });

  return promise;
};

Keys.onPressDown('GeneralUse', () => {
  if (!raycastCoords || !resolver || !ghostEnt) {
    return;
  }
  resolver({ coords: Util.getEntityCoords(ghostEnt), rot: Util.getEntityRotation(ghostEnt) });
});

Keys.onPressDown('object-toggle-ground', () => {
  if (!ghostEnt) return;
  groundObject = !groundObject;
});

Keys.register('object-toggle-ground', '(editor) Toggle ground sticky', 'Z');

Keys.onPressDown('object-rotate-left', () => {
  if (!ghostThread || !ghostThread.isActive) return;
  ghostThread.data.rotation += Keys.isModPressed() ? 1 : 15;
});

Keys.onPressDown('object-rotate-right', () => {
  if (!ghostThread || !ghostThread.isActive) return;
  ghostThread.data.rotation -= Keys.isModPressed() ? 1 : 15;
});

Keys.onPressDown('object-place', () => {
  if (!ghostThread || !ghostThread.isActive) return;
  ghostThread.stop();
  const coords = Util.getEntityCoords(ghostThread.data.entity);
  const rotation = Util.getEntityRotation(ghostThread.data.entity);
  ghostThread.data.res(ghostThread.data.validLocation ? { coords, rotation } : null);
  DeleteEntity(ghostThread.data.entity);
});

Keys.register('object-rotate-left', '(editor) Rotate left', 'IOM_WHEEL_DOWN', 'MOUSE_WHEEL');
Keys.register('object-rotate-right', '(editor) Rotate right', 'IOM_WHEEL_UP', 'MOUSE_WHEEL');
Keys.register('object-place', '(editor) place Object', 'ENTER', 'KEYBOARD');

global.exports('startGhostPlacement', startGhostPlacement);
