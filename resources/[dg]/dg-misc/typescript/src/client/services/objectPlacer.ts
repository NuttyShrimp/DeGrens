import { Keys, UI, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

let ghostEnt: number | null = null;
let ghostCoords: Vec3 | null = null;
let placeTick: number | null = null;
let rotation: number = 0;
let groundObject: boolean = true;
let resolver: ((res: { coords: Vec3; rot: Vec3 } | null) => void) | null = null;

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
    ghostCoords = hitCoords;
  }
};

const positionGhostObject = () => {
  updateGhostPosition();
  if (ghostCoords && ghostEnt) {
    SetEntityCoords(ghostEnt, ghostCoords.x, ghostCoords.y, ghostCoords.z, false, false, false, false);
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

export const startObjectPlacement = async (model: string): Promise<{ coords: Vec3; rot: Vec3 } | null> => {
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

Keys.onPressDown('GeneralUse', () => {
  if (!ghostCoords || !resolver || !ghostEnt) {
    return;
  }
  resolver({ coords: Util.getEntityCoords(ghostEnt), rot: Util.getEntityRotation(ghostEnt) });
});

Keys.onPressDown('object-toggle-ground', () => {
  if (!ghostEnt) return;
  groundObject = !groundObject;
});

Keys.register('object-toggle-ground', '(editor) Toggle ground sticky', 'Z');
