import { Util } from '@dgx/client';

let originalWalk: string | null = null;
let crouching = false;

export const changeWalk = (walk: string) => {
  originalWalk = walk;
};

export const toggleCrouching = () => {
  if (!LocalPlayer.state.isLoggedIn) return;

  const ped = PlayerPedId();
  const isFreeAiming = IsPlayerFreeAiming(PlayerId());
  if (IsPedSittingInAnyVehicle(ped) || IsPedFalling(ped) || isFreeAiming) return;

  crouching = !crouching;
  if (crouching) {
    ClearPedTasks(ped);
    setCrouchWalk();
    startCrouchThread();
  } else {
    ClearPedTasks(ped);
    resetToOriginalWalk();
  }
};

const startCrouchThread = () => {
  const ped = PlayerPedId();
  const crouchThread = setInterval(() => {
    if (!crouching) {
      clearInterval(crouchThread);
      return;
    }

    if (IsPlayerFreeAiming(PlayerId())) {
      crouching = false;
      ClearPedTasks(ped);
      resetToOriginalWalk();
      return;
    }

    const speed = GetEntitySpeed(ped);
    if (speed >= 1.0) {
      SetPedWeaponMovementClipset(ped, 'move_ped_crouched');
      SetPedStrafeClipset(ped, 'move_ped_crouched_strafing');
    } else if (speed < 1.0 && GetFollowPedCamViewMode() == 4) {
      ResetPedWeaponMovementClipset(ped);
      ResetPedStrafeClipset(ped);
    }
  }, 10);
};

const setCrouchWalk = async () => {
  const ped = PlayerPedId();
  await Util.loadAnimSet('move_ped_crouched');
  SetPedMovementClipset(ped, 'move_ped_crouched', 1.0);
  SetPedWeaponMovementClipset(ped, 'move_ped_crouched');
  SetPedStrafeClipset(ped, 'move_ped_crouched_strafing');
};

const resetToOriginalWalk = async () => {
  const ped = PlayerPedId();
  ResetPedMovementClipset(ped, 1.0);
  ResetPedWeaponMovementClipset(ped);
  ResetPedStrafeClipset(ped);

  if (originalWalk === null) return;
  await Util.loadAnimSet(originalWalk);
  SetPedMovementClipset(ped, originalWalk, 1.0);
  RemoveAnimSet(originalWalk);
};
