import { Animations, Keys, Notifications, UI, Util } from '@dgx/client';
import { ENABLED_KEYS_IN_BED } from './constants.beds';

let inBed = false;
let bedCam: number | null = null;
let canLeaveBed = false;
let bedAnimLoopId: number | null = null;

export const enterBed = async (position: Vec4, timeout: number) => {
  if (inBed) return;

  inBed = true;
  canLeaveBed = false;

  DoScreenFadeOut(250);
  await Util.awaitCondition(() => IsScreenFadedOut());

  const ped = PlayerPedId();
  SetEntityCoords(ped, position.x, position.y, position.z - 0.05, false, false, false, false);
  SetEntityHeading(ped, position.w);
  FreezeEntityPosition(ped, true);

  await Util.loadAnimDict('mini@cpr@char_b@cpr_def');

  if (bedAnimLoopId !== null) {
    Animations.stopAnimLoop(bedAnimLoopId);
  }
  bedAnimLoopId = Animations.startAnimLoop({
    animation: {
      dict: 'mini@cpr@char_b@cpr_def',
      name: 'cpr_pumpchest_idle',
      flag: 1,
    },
    weight: 100, // Anim should overwrite cuffs and downstate
    disableAllControls: true,
    disableFiring: true,
    enabledControls: ENABLED_KEYS_IN_BED,
  });

  createBedCam();

  await Util.Delay(250);
  DoScreenFadeIn(250);

  setTimeout(() => {
    UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Opstaan`);
    canLeaveBed = true;
  }, timeout);
};

export const leaveBed = async () => {
  if (!inBed) return;

  if (!canLeaveBed) {
    Notifications.add('Je bent nog niet geholpen', 'error');
    return;
  }

  inBed = false;

  if (bedAnimLoopId !== null) {
    Animations.stopAnimLoop(bedAnimLoopId);
    bedAnimLoopId = null;
  }

  // pause to allow proper leaving anim
  Animations.pauseAnimLoopAnimations(true);

  UI.hideInteraction();

  DoScreenFadeOut(250);
  await Util.awaitCondition(() => IsScreenFadedOut());
  setTimeout(() => {
    DoScreenFadeIn(250);
  }, 500);

  const ped = PlayerPedId();
  FreezeEntityPosition(ped, false);
  destroyBedCam();

  const coords = Util.getEntityCoords(ped);
  SetEntityCoords(ped, coords.x, coords.y, coords.z - 1.6, false, false, false, false);

  await Util.loadAnimDict('anim@mp_bedmid@right_var_04');
  TaskPlayAnim(ped, 'anim@mp_bedmid@right_var_04', 'f_getout_r_bighouse', 8.0, 8.0, -1, 0, 0, false, false, false);
  await Util.Delay(3000);
  StopAnimTask(ped, 'anim@mp_bedmid@right_var_04', 'f_getout_r_bighouse', 1);
  RemoveAnimDict('anim@mp_bedmid@right_var_04');

  Animations.pauseAnimLoopAnimations(false);

  Util.setWalkstyle('move_m@injured');
};

const createBedCam = () => {
  if (bedCam !== null) {
    destroyBedCam();
  }

  const ped = PlayerPedId();
  bedCam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
  SetCamActive(bedCam, true);
  RenderScriptCams(true, false, 1, true, true);
  AttachCamToPedBone(bedCam, ped, 31085, 0, 1.5, 1.0, true);
  SetCamFov(bedCam, 75.0);
  SetCamRot(bedCam, -50.0, 0.0, GetEntityHeading(ped) + 180, 1);
};

const destroyBedCam = () => {
  if (bedCam === null) return;
  RenderScriptCams(false, false, 200, true, true);
  DestroyCam(bedCam, false);
  bedCam = null;
};
