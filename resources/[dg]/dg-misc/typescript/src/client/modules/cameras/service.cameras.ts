import { Util } from '@dgx/client';
import { CAMERAS_ENABLED_CONTROLS, CAMERA_MOVEMENT_MODIFIERS } from './constants.cameras';
import { createCameraScaleform } from './helpers.cameras';

type Direction = keyof typeof CAMERA_MOVEMENT_MODIFIERS;

let activeCamera: {
  cam: number;
  thread: NodeJS.Timer;
  minimap: boolean;
  movementThreads: Partial<Record<Direction, NodeJS.Timer>>;
  info: Misc.Cameras.Info;
} | null = null;

export const isCameraActive = () => !!activeCamera;

export const enterCamera = async (info: Misc.Cameras.Info) => {
  if (activeCamera) {
    await exitCamera();
  }

  await Util.toggleScreenFadeOut(true, 250);

  global.exports['dg-lib'].shouldExecuteKeyMaps(false);

  // focus map around camera
  SetFocusPosAndVel(info.coords.x, info.coords.y, info.coords.z, 0, 0, 0);

  // cam
  const cam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
  SetCamCoord(cam, info.coords.x, info.coords.y, info.coords.z);
  SetCamRot(cam, info.rotation.x, info.rotation.y, info.rotation.z, 2);
  RenderScriptCams(true, false, 0, true, true);

  // Timecycle shit
  SetTimecycleModifier('scanline_cam_cheap');
  SetTimecycleModifierStrength(1);

  const scaleform = await createCameraScaleform();

  const minimap = !!IsRadarEnabled();
  const thread = setInterval(() => {
    if (!activeCamera) {
      clearInterval(thread);
      return;
    }

    DisableAllControlActions(0);
    CAMERAS_ENABLED_CONTROLS.forEach(id => {
      EnableControlAction(0, id, true);
    });

    DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0);
    DisplayRadar(false);
  }, 0);

  activeCamera = {
    cam,
    minimap,
    thread,
    movementThreads: {},
    info,
  };

  await Util.loadCollisionAroundCoord(info.coords);
  await Util.Delay(500);

  await Util.toggleScreenFadeOut(false, 250);
};

export const exitCamera = async () => {
  if (!activeCamera) return;

  await Util.toggleScreenFadeOut(true, 250);

  global.exports['dg-lib'].shouldExecuteKeyMaps(true);

  // cam
  clearInterval(activeCamera.thread);
  DestroyCam(activeCamera.cam, false);
  RenderScriptCams(false, false, 1, true, true);
  ClearTimecycleModifier();

  // restore minimap to original state
  if (activeCamera.minimap) {
    DisplayRadar(true);
  }

  // focus player
  const ped = PlayerPedId();
  SetFocusEntity(PlayerPedId());

  // clear all movement key threads
  (Object.keys(activeCamera.movementThreads) as Direction[]).forEach(direction => clearCameraMovementThread(direction));

  activeCamera.info.onClose?.();
  activeCamera = null;

  await Util.loadCollisionAroundEntity(ped);
  await Util.Delay(500);

  await Util.toggleScreenFadeOut(false, 250);
};

export const handleCameraMovementKeyAction = (direction: keyof typeof CAMERA_MOVEMENT_MODIFIERS, isDown: boolean) => {
  if (!activeCamera || !activeCamera.info.allowMovement) return;

  clearCameraMovementThread(direction);

  if (!isDown) return;

  const thread = setInterval(() => {
    if (!activeCamera) {
      clearInterval(thread);
      return;
    }

    const cameraRotation = Util.ArrayToVector3(GetCamRot(activeCamera.cam, 2));
    if (direction === 'up' && cameraRotation.x > 0) return;
    if (direction === 'down' && cameraRotation.x < -50.0) return;
    const modifier = CAMERA_MOVEMENT_MODIFIERS[direction];
    SetCamRot(
      activeCamera.cam,
      cameraRotation.x + modifier.x,
      cameraRotation.y + modifier.y,
      cameraRotation.z + modifier.z,
      2
    );
  }, 1);

  activeCamera.movementThreads[direction] = thread;
};

const clearCameraMovementThread = (direction: Direction) => {
  if (!activeCamera?.movementThreads[direction]) return;
  clearInterval(activeCamera.movementThreads[direction]);
  delete activeCamera.movementThreads[direction];
};
