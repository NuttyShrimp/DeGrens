import { Keys, Util } from '@dgx/client';

let pointing = false;
let pointingThread: NodeJS.Timer | null = null;

Keys.register('misc_point', '(misc) wijzen', 'B');

Keys.onPressDown('misc_point', () => {
  if (pointing) {
    stopPointing();
    return;
  }
  startPointing();
});

const stopPointing = () => {
  const ped = PlayerPedId();
  RequestTaskMoveNetworkStateTransition(ped, 'Stop');
  ClearPedSecondaryTask(ped);
  if (!IsPedInAnyVehicle(ped, true)) {
    SetPedCurrentWeaponVisible(ped, true, true, true, true);
  }
  SetPedConfigFlag(ped, 36, false);
  if (pointingThread) {
    clearInterval(pointingThread);
    pointingThread = null;
  }
  pointing = false;
};

const startPointing = async () => {
  const ped = PlayerPedId();
  await Util.loadAnimDict('anim@mp_point');
  SetPedCurrentWeaponVisible(ped, false, true, true, true);
  SetPedConfigFlag(ped, 36, true);
  TaskMoveNetworkByName(ped, 'task_mp_pointing', 0.5, false, 'anim@mp_point', 24);
  RemoveAnimDict('anim@mp_point');
  pointing = true;
  pointingThread = setInterval(() => {
    const ped = PlayerPedId();
    let camPitch = GetGameplayCamRelativePitch();
    if (camPitch < -70) camPitch = 70;
    if (camPitch > 42) camPitch = 42;
    camPitch = (camPitch + 70) / 112;

    let camHeading = GetGameplayCamRelativeHeading();
    const cosCH = Math.cos(camHeading);
    const sinCH = Math.sin(camHeading);
    if (camHeading < -180) camHeading = -180;
    if (camHeading > 180) camHeading = 180;
    camHeading = (camHeading + 180) / 360;

    const coords = GetOffsetFromEntityInWorldCoords(
      ped,
      cosCH * -0.2 - sinCH * (0.4 * (camHeading + 0.3)),
      cosCH * -0.2 + sinCH * (0.4 * (camHeading + 0.3)),
      0.6
    );
    const ray = StartShapeTestCapsule(
      coords[0],
      coords[1],
      coords[2] - 0.2,
      coords[0],
      coords[1],
      coords[2] + 0.2,
      0.4,
      95,
      ped,
      7
    );
    const [_n, blocked] = GetRaycastResult(ray);
    SetTaskMoveNetworkSignalFloat(ped, 'Pitch', camPitch);
    SetTaskMoveNetworkSignalFloat(ped, 'Heading', camHeading * -1.0 + 1.0);
    SetTaskMoveNetworkSignalBool(ped, 'isBlocked', blocked);
    SetTaskMoveNetworkSignalBool(ped, 'isFirstPerson', GetCamViewModeForContext(GetCamActiveViewModeContext()) == 4);
  }, 1);
};
