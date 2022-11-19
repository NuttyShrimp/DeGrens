import { Util } from '@dgx/client';
import { MAX_FOV, MIN_FOV, SPEED_X, SPEED_Y, ZOOM_SPEED } from './constants.heli';

let inPoliceHeli = false;
let heliCamOn = false;

let currentFov = (MAX_FOV + MIN_FOV) / 2;
let visionState = 0;

export const isInPoliceHeli = () => inPoliceHeli;
export const setInPoliceHeli = (val: boolean) => {
  inPoliceHeli = val;

  if (!inPoliceHeli) {
    setHeliCamOn(false);
    SetNightvision(false);
    SetSeethrough(false);
    visionState = 0;
  }
};

export const isHeliCamOn = () => heliCamOn;
export const setHeliCamOn = (val: boolean) => {
  heliCamOn = val;

  if (heliCamOn) {
    enableHeliCam();
  }
};

const enableHeliCam = async () => {
  SetTimecycleModifier('heliGunCam');
  SetTimecycleModifierStrength(0.3);

  const ped = PlayerPedId();
  const heli = GetVehiclePedIsIn(ped, false);
  const cam = CreateCam('DEFAULT_SCRIPTED_FLY_CAMERA', true);
  AttachCamToEntity(cam, heli, 0, 3.5, -0.5, true);
  SetCamRot(cam, 0, 0, GetEntityHeading(heli), 0);
  SetCamFov(cam, currentFov);
  RenderScriptCams(true, false, 0, true, false);

  const scaleform = RequestScaleformMovie('HELI_CAM');
  await Util.awaitCondition(() => HasScaleformMovieLoaded(scaleform));
  PushScaleformMovieFunction(scaleform, 'SET_CAM_LOGO');
  PushScaleformMovieFunctionParameterInt(0);
  PopScaleformMovieFunctionVoid();

  const tick = setTick(() => {
    if (!heliCamOn) {
      clearTick(tick);

      ClearTimecycleModifier();
      currentFov = (MAX_FOV + MIN_FOV) / 2;
      RenderScriptCams(false, false, 0, true, false);
      SetScaleformMovieAsNoLongerNeeded(scaleform);
      DestroyCam(cam, false);
      SetNightvision(false);
      SetSeethrough(false);
      visionState = 0;

      return;
    }

    const zoomValue = (1 / (MAX_FOV - MIN_FOV)) * (currentFov - MIN_FOV);
    checkInputRotation(cam, zoomValue);
    handleZoom(cam);
    const coords = Util.ArrayToVector3(GetEntityCoords(heli, false));
    const rotation = Util.ArrayToVector3(GetCamRot(cam, 2));
    PushScaleformMovieFunction(scaleform, 'SET_ALT_FOV_HEADING');
    PushScaleformMovieFunctionParameterFloat(coords.z);
    PushScaleformMovieFunctionParameterFloat(zoomValue);
    PushScaleformMovieFunctionParameterFloat(rotation.z);
    PopScaleformMovieFunctionVoid();
    DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0);
  });
};

const checkInputRotation = (cam: number, zoomValue: number) => {
  const rightAxisX = GetDisabledControlNormal(0, 220);
  const rightAxisY = GetDisabledControlNormal(0, 221);
  const rotation = Util.ArrayToVector3(GetCamRot(cam, 2));
  if (rightAxisX !== 0 || rightAxisY !== 0) {
    const new_z = rotation.z + rightAxisX * -1.0 * SPEED_Y * (zoomValue + 0.1);
    const new_x = Math.max(Math.min(20.0, rotation.x + rightAxisY * -1.0 * SPEED_X * (zoomValue + 0.1)), -89.5);
    SetCamRot(cam, new_x, 0.0, new_z, 2);
  }
};

const handleZoom = (cam: number) => {
  if (IsControlJustPressed(0, 241)) {
    currentFov = Math.max(currentFov - ZOOM_SPEED, MIN_FOV);
  }
  if (IsControlJustPressed(0, 242)) {
    currentFov = Math.min(currentFov + ZOOM_SPEED, MAX_FOV);
  }
  const oldFov = GetCamFov(cam);
  if (Math.abs(currentFov - oldFov) < 0.1) {
    currentFov = oldFov;
  }
  SetCamFov(cam, oldFov + (currentFov - oldFov) * 0.05);
};

export const changeVision = () => {
  if (visionState === 0) {
    SetNightvision(true);
    visionState = 1;
  } else if (visionState === 1) {
    SetNightvision(false);
    SetSeethrough(true);
    visionState = 2;
  } else {
    SetSeethrough(false);
    visionState = 0;
  }
};
