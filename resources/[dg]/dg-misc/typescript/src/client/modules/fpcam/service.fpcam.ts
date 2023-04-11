import { Notifications, Util } from '@dgx/client';
import { ENABLED_CONTROLS, MAX_FOV, MIN_FOV, SPEED_X, SPEED_Y, ZOOM_SPEED } from './constants.fpcam';

let camEnabled = false;
let currentFov = 0;

export const isFPCamEnabled = () => camEnabled;

export const startFPCam = async () => {
  if (camEnabled) return;

  camEnabled = true;

  const ped = PlayerPedId();
  if (IsPedInAnyVehicle(ped, true)) {
    Notifications.add('Je kan dit niet vanuit een voertuig', 'error');
    return;
  }

  global.exports['dg-lib'].shouldExecuteKeyMaps(false);

  const cam = CreateCam('DEFAULT_SCRIPTED_FLY_CAMERA', true);
  AttachCamToEntity(cam, ped, 0.0, 0.7, 0.7, true);
  SetCamRot(cam, 0, 0, GetEntityHeading(ped), 0);
  currentFov = (MAX_FOV + MIN_FOV) / 2;
  SetCamFov(cam, currentFov);
  RenderScriptCams(true, false, 0, true, false);

  await new Promise(res => {
    const interval = setInterval(() => {
      if (
        !camEnabled ||
        IsEntityDead(ped) ||
        IsPedInAnyVehicle(ped, true) ||
        IsControlJustPressed(0, 199) ||
        IsControlJustPressed(0, 200)
      ) {
        clearInterval(interval);
        res(null);
        return;
      }

      DisableAllControlActions(0);
      ENABLED_CONTROLS.forEach(control => EnableControlAction(0, control, true));

      const zoomValue = (1 / (MAX_FOV - MIN_FOV)) * (currentFov - MIN_FOV);
      handleRotation(cam, zoomValue);

      currentFov = handleZoom(cam, currentFov);
    }, 1);
  });

  // Stop pausemenu from opening from esc press to exit
  let counter = 100;
  const interval = setInterval(() => {
    if (counter === 0) {
      clearInterval(interval);
      return;
    }
    if (IsPauseMenuActive()) {
      SetPauseMenuActive(false);
    }
    DisableControlAction(0, 199, true);
    DisableControlAction(0, 200, true);
    counter--;
  }, 1);

  camEnabled = false;

  RenderScriptCams(false, false, 0, true, false);
  DestroyCam(cam, false);
  global.exports['dg-lib'].shouldExecuteKeyMaps(true);
};

const handleRotation = (cam: number, zoomValue: number) => {
  const xControl = GetDisabledControlNormal(0, 220);
  const yControl = GetDisabledControlNormal(0, 221);
  const rotation = Util.ArrayToVector3(GetCamRot(cam, 2));
  if (xControl === 0 && yControl === 0) return;

  const newZ = rotation.z + xControl * -1.0 * SPEED_Y * (zoomValue + 0.1);
  const newX = Math.max(Math.min(20.0, rotation.x + yControl * -1.0 * SPEED_X * (zoomValue + 0.1)), -89.5);
  SetCamRot(cam, newX, 0.0, newZ, 2);
  SetEntityHeading(PlayerPedId(), newZ);
};

const handleZoom = (cam: number, oldFov: number) => {
  let newFov = oldFov;
  if (IsControlJustPressed(0, 241)) {
    newFov = Math.max(newFov - ZOOM_SPEED, MIN_FOV);
  }
  if (IsControlJustPressed(0, 242)) {
    newFov = Math.min(newFov + ZOOM_SPEED, MAX_FOV);
  }
  const camFov = GetCamFov(cam);
  if (Math.abs(newFov - camFov) < 0.1) {
    newFov = camFov;
  }
  SetCamFov(cam, camFov + (newFov - camFov) * 0.05);
  return newFov;
};
