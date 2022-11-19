import { Notifications, PropAttach, Util } from '@dgx/client';
import { MAX_FOV, MIN_FOV, SPEED_X, SPEED_Y, ZOOM_SPEED } from './constants.binoculars';

let enabled = false;
let fov = 0;

export const enableBinoculars = async (type: 'binoculars' | 'pd_camera') => {
  if (enabled) return;

  const ped = PlayerPedId();
  if (IsPedInAnyVehicle(ped, true)) {
    Notifications.add('Je kan dit niet vanuit een voertuig', 'error');
    return;
  }

  enabled = true;
  global.exports['dg-lib'].shouldExecuteKeyMaps(false);

  if (type === 'binoculars') {
    TaskStartScenarioInPlace(ped, 'WORLD_HUMAN_BINOCULARS', 0, true);
  } else if (type === 'pd_camera') {
    await Util.loadAnimDict('amb@world_human_paparazzi@male@base');
    TaskPlayAnim(ped, 'amb@world_human_paparazzi@male@base', 'base', 2.0, 2.0, -1, 17, 1, false, false, false);
    const propId = (await PropAttach.add('camera')) ?? 0;
    const propCheckThread = setInterval(() => {
      if (enabled) return;
      PropAttach.remove(propId);
      clearInterval(propCheckThread);
      return;
    }, 10);
  }
  await Util.Delay(1500);

  const cam = CreateCam('DEFAULT_SCRIPTED_FLY_CAMERA', true);

  AttachCamToEntity(cam, ped, 0.0, 1.0, 0.0, true);
  SetCamRot(cam, 0, 0, GetEntityHeading(ped), 0);
  fov = (MAX_FOV + MIN_FOV) / 2;
  SetCamFov(cam, fov);
  RenderScriptCams(true, false, 0, true, false);

  let scaleform = 0;

  if (type === 'binoculars') {
    scaleform = RequestScaleformMovie('BINOCULARS');
    await Util.awaitCondition(() => HasScaleformMovieLoaded(scaleform));
    PushScaleformMovieFunction(scaleform, 'SET_CAM_LOGO');
    PushScaleformMovieFunctionParameterInt(0);
    PopScaleformMovieFunctionVoid();
  } else if (type === 'pd_camera') {
    SetTimecycleModifier('scanline_cam_cheap');
    SetTimecycleModifierStrength(1.5);
  }

  await new Promise(res => {
    const interval = setInterval(() => {
      if (
        !enabled ||
        IsEntityDead(ped) ||
        IsPedInAnyVehicle(ped, true) ||
        IsControlJustPressed(0, 199) ||
        IsControlJustPressed(0, 200)
      ) {
        clearInterval(interval);
        res(null);
        ClearPedTasks(ped);
        return;
      }

      const zoomValue = (1 / (MAX_FOV - MIN_FOV)) * (fov - MIN_FOV);
      checkInputRotation(cam, zoomValue);

      handleZoom(cam);

      if (type === 'binoculars') {
        DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0);
      }
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

  enabled = false;

  RenderScriptCams(false, false, 0, true, false);
  DestroyCam(cam, false);
  global.exports['dg-lib'].shouldExecuteKeyMaps(true);

  if (type === 'binoculars') {
    SetScaleformMovieAsNoLongerNeeded(scaleform);
  } else if (type === 'pd_camera') {
    ClearTimecycleModifier();
  }
};

const checkInputRotation = (cam: number, zoomValue: number) => {
  const rightAxisX = GetDisabledControlNormal(0, 220);
  const rightAxisY = GetDisabledControlNormal(0, 221);
  const rotation = Util.ArrayToVector3(GetCamRot(cam, 2));
  if (rightAxisX !== 0 || rightAxisY !== 0) {
    const new_z = rotation.z + rightAxisX * -1.0 * SPEED_Y * (zoomValue + 0.1);
    const new_x = Math.max(Math.min(20.0, rotation.x + rightAxisY * -1.0 * SPEED_X * (zoomValue + 0.1)), -89.5);
    SetCamRot(cam, new_x, 0.0, new_z, 2);
    SetEntityHeading(PlayerPedId(), new_z);
  }
};

const handleZoom = (cam: number) => {
  if (IsControlJustPressed(0, 241)) {
    fov = Math.max(fov - ZOOM_SPEED, MIN_FOV);
  }
  if (IsControlJustPressed(0, 242)) {
    fov = Math.min(fov + ZOOM_SPEED, MAX_FOV);
  }
  const currentFov = GetCamFov(cam);
  if (Math.abs(fov - currentFov) < 0.1) {
    fov = currentFov;
  }
  SetCamFov(cam, currentFov + (fov - currentFov) * 0.05);
};
