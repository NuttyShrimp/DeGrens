import { Keys, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

const OFFSET = -0.75;

let canShoulderSwap = false;
let shoulderCam: number | null = null;

Keys.register('shoulder_swap', '(weapons) shoulderswap', 'E');
Keys.onPress('shoulder_swap', down => {
  if (down) {
    if (!canShoulderSwap) return;
    startShoulderSwap();
  } else {
    stopShoulderSwap();
  }
});

export const setCanShoulderSwap = (val: boolean) => {
  canShoulderSwap = val;

  if (!canShoulderSwap) {
    stopShoulderSwap();
  }
};

const startShoulderSwap = () => {
  if (shoulderCam !== null) return;
  if (IsPedInAnyVehicle(PlayerPedId(), false)) return;

  shoulderCam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
  SetCamActive(shoulderCam, true);
  RenderScriptCams(true, false, 0, true, true);

  let clipTimeout = 0;

  const t = setInterval(() => {
    if (shoulderCam === null || !DoesCamExist(shoulderCam)) {
      clearInterval(t);
      return;
    }

    const camCoords = Util.ArrayToVector3(GetGameplayCamCoord());
    const camRotation = Util.ArrayToVector3(GetGameplayCamRot(0));
    const camFov = GetGameplayCamFov();

    const offsetCoords = Util.getOffsetFromCoords({ ...camCoords, w: camRotation.z }, { x: OFFSET, y: 0, z: 0 });

    const hit = checkRaycastHit(offsetCoords, camRotation);

    if (hit) {
      clipTimeout = 200;
    } else {
      clipTimeout = Math.max(clipTimeout - 1, 0);
    }

    const useOffset = !hit && clipTimeout === 0;
    const finalCoords = useOffset ? offsetCoords : camCoords;
    SetCamCoord(shoulderCam, finalCoords.x, finalCoords.y, finalCoords.z);
    SetCamRot(shoulderCam, camRotation.x, camRotation.y, camRotation.z, 0);
    SetCamFov(shoulderCam, camFov);
  }, 1);
};

const stopShoulderSwap = () => {
  if (shoulderCam === null) return;

  DestroyCam(shoulderCam, false);
  RenderScriptCams(false, false, 0, true, true);
  shoulderCam = null;
};

const checkRaycastHit = (camCoords: Vec3, camRotation: Vec3) => {
  const ped = PlayerPedId();
  const pedCoords = Util.getEntityCoords(ped);
  const offset = Util.getOffsetFromCoords(
    { ...Vector3.create(camCoords).add(getForwardVector(camRotation).multiply(0.1)), w: camRotation.z },
    { x: -0.6, y: -0.1, z: 0 }
  );

  const handle = StartShapeTestRay(offset.x, offset.y, offset.z, pedCoords.x, pedCoords.y, pedCoords.z, -1, ped, 0);
  const hit = GetShapeTestResult(handle)[1] as boolean;

  return hit;
};

const getForwardVector = (rotation: Vec3) => {
  const rot = Vector3.create(rotation).multiply(Math.PI / 180);
  return Vector3.create({
    x: -Math.sin(rot.z) * Math.abs(Math.cos(rot.x)),
    y: Math.cos(rot.z) * Math.abs(Math.cos(rot.x)),
    z: Math.sin(rot.x),
  });
};
