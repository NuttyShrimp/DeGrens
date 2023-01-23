import { Animations, Events, Jobs, Notifications, UI, Util } from '@dgx/client';

let cams: Dispatch.Cams.Cam[] = [];
let activeCamera: number = 0;
let scaleformThread: number = 0;
let moveKeyThreads: Record<Direction, NodeJS.Timer | undefined> = {
  up: undefined,
  down: undefined,
  left: undefined,
  right: undefined,
};

const DISABLED_CONTROLS = [30, 31, 32, 33, 34, 35];

Events.onNet('dispatch:cams:set', (pCams: Dispatch.Cams.Cam[]) => {
  cams = pCams;
  seedUICams();
});

const createScaleform = async () => {
  const scaleform = RequestScaleformMovie('instructional_buttons');
  await Util.awaitCondition(() => HasScaleformMovieLoaded(scaleformThread));
  BeginScaleformMovieMethod(scaleform, 'CLEAR_ALL');
  EndScaleformMovieMethod();

  BeginScaleformMovieMethod(scaleform, 'SET_CLEAR_SPACE');
  ScaleformMovieMethodAddParamInt(200);
  EndScaleformMovieMethod();

  BeginScaleformMovieMethod(scaleform, 'SET_DATA_SLOT');

  ScaleformMovieMethodAddParamInt(1);
  const instructionalBtn = GetControlInstructionalButton(
    2,
    GetHashKey('+keybind_wrapper__+closeDispatchCam') | 0x80000000,
    true
  );
  ScaleformMovieMethodAddParamPlayerNameString(instructionalBtn);

  BeginTextCommandScaleformString('STRING');
  AddTextComponentSubstringKeyboardDisplay('Sluit Camera');
  EndTextCommandScaleformString();

  EndScaleformMovieMethod();

  BeginScaleformMovieMethod(scaleform, 'DRAW_INSTRUCTIONAL_BUTTONS');
  EndScaleformMovieMethod();

  BeginScaleformMovieMethod(scaleform, 'SET_BACKGROUND_COLOUR');
  ScaleformMovieMethodAddParamInt(0);
  ScaleformMovieMethodAddParamInt(0);
  ScaleformMovieMethodAddParamInt(0);
  ScaleformMovieMethodAddParamInt(80);
  EndScaleformMovieMethod();

  return scaleform;
};

export const seedUICams = () => {
  UI.SendAppEvent('dispatch', {
    action: 'addCams',
    cams: cams.map((c, idx) => ({ label: c.label, id: idx + 1 })),
  });
};

export const openCam = async (id: number) => {
  if (Jobs.getCurrentJob().name !== 'police') return;
  if (activeCamera) {
    closeCam();
  }
  const camInfo = cams[id - 1];
  if (!camInfo) {
    Notifications.add(`Camera ${id} bestaat niet`);
    return;
  }
  UI.closeApplication('dispatch');

  DoScreenFadeOut(250);
  Animations.startTabletAnimation();
  await Util.awaitCondition(() => IsScreenFadedOut());

  FreezeEntityPosition(PlayerPedId(), true);
  const keyDisableThread = setInterval(() => {
    if (!activeCamera) {
      clearInterval(keyDisableThread);
      return;
    }

    DISABLED_CONTROLS.forEach(id => {
      DisableControlAction(0, id, true);
    });
  }, 0);

  SetFocusPosAndVel(camInfo.coords.x, camInfo.coords.y, camInfo.coords.z, 0, 0, 0);
  activeCamera = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
  SetCamCoord(activeCamera, camInfo.coords.x, camInfo.coords.y, camInfo.coords.z);
  SetCamRot(activeCamera, camInfo.defaultRotation.x, camInfo.defaultRotation.y, camInfo.defaultRotation.z, 2);
  RenderScriptCams(true, false, 0, true, true);

  if (scaleformThread) {
    clearTick(scaleformThread);
  }
  const instructions = await createScaleform();
  SetTimecycleModifier('scanline_cam_cheap');
  SetTimecycleModifierStrength(1);
  scaleformThread = setTick(() => {
    DrawScaleformMovieFullscreen(instructions, 255, 255, 255, 255, 0);
    DisplayRadar(false);
  });
  DoScreenFadeIn(250);
};

export const closeCam = async () => {
  if (!activeCamera) return;
  DoScreenFadeOut(250);
  await Util.awaitCondition(() => IsScreenFadedOut());

  clearTick(scaleformThread);
  scaleformThread = 0;

  DestroyCam(activeCamera, false);
  RenderScriptCams(false, false, 1, true, true);
  activeCamera = 0;
  ClearTimecycleModifier();
  SetFocusEntity(PlayerPedId());
  DisplayRadar(IsPedInAnyVehicle(PlayerPedId(), false));
  FreezeEntityPosition(PlayerPedId(), false);
  (['up', 'down', 'left', 'right'] as Direction[]).forEach(stopCamMoveThread);

  DoScreenFadeIn(250);
  Animations.stopTabletAnimation();
};

const moveModifier: Record<Direction, Vec3> = {
  up: { x: 0.7, y: 0, z: 0 },
  down: { x: -0.7, y: 0, z: 0 },
  left: { x: 0, y: 0, z: 0.7 },
  right: { x: 0, y: 0, z: -0.7 },
};

export const moveCam = (dir: Direction) => {
  if (!activeCamera) return;
  const camRot = Util.ArrayToVector3(GetCamRot(activeCamera, 2));
  if (dir === 'up' && camRot.x > 0) return;
  if (dir === 'down' && camRot.x < -50.0) return;
  const mod = moveModifier[dir];
  SetCamRot(activeCamera, camRot.x + mod.x, camRot.y + mod.y, camRot.z + mod.z, 2);
};

export const startCamMoveThread = (dir: Direction) => {
  if (!activeCamera) return;
  stopCamMoveThread(dir);
  moveKeyThreads[dir] = setInterval(() => {
    moveCam(dir);
  }, 10);
};

export const stopCamMoveThread = (dir: Direction) => {
  if (!moveKeyThreads[dir]) return;
  clearInterval(moveKeyThreads[dir]);
  moveKeyThreads[dir] = undefined;
};
