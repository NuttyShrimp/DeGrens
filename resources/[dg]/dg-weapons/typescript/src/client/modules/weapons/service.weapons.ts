import { Events, Util } from '@dgx/client';
import { showReticle } from './helpers.weapons';

let currentWeaponData: Weapons.WeaponItem | null = null;
let weaponThread: NodeJS.Timer | null = null;

export const getCurrentWeaponData = () => currentWeaponData;
export const setCurrentWeaponData = (data: typeof currentWeaponData) => {
  currentWeaponData = data;

  if (weaponThread !== null) {
    clearInterval(weaponThread);
    weaponThread = null;
    showReticle(false);
  }

  if (data !== null) {
    startWeaponThread();
  }
};

export const startWeaponThread = () => {
  const playerId = PlayerId();
  let qualityDecrease = 0;
  let reticleEnabled = false;
  let previousViewMode = 1;
  let viewModeReset = false;

  // To emit shot event for GSR
  let shotFired = false;

  // To keep track of shots fired for bullet casings
  let previousAmmoCount = Number(GetAmmoInPedWeapon(PlayerPedId(), currentWeaponData!.hash));
  let shotFirePositions: Vec3[] = [];

  // needed for checking evidence
  let isFreeAiming = IsPlayerFreeAiming(playerId);

  weaponThread = setInterval(() => {
    if (currentWeaponData === null) return;

    const ped = PlayerPedId();
    const weapon = currentWeaponData?.hash;
    const ammoInWeapon = Number(GetAmmoInPedWeapon(ped, weapon));

    if (IsPedShooting(ped) && ammoInWeapon > 0) {
      // Add GSR for first shot
      if (!shotFired) {
        Events.emitNet('weapons:server:firstShot', currentWeaponData.hash);
        shotFired = true;
      }
      qualityDecrease++;
    }

    if (ammoInWeapon < previousAmmoCount) {
      const plyCoords = Util.getEntityCoords(ped);
      shotFirePositions.push(plyCoords);
    }

    if (IsControlJustReleased(0, 24) || IsDisabledControlJustReleased(0, 24)) {
      Events.emitNet(
        'weapons:server:stoppedShooting',
        currentWeaponData.id,
        ammoInWeapon,
        qualityDecrease,
        shotFirePositions
      );
      qualityDecrease = 0;
      SetPedUsingActionMode(ped, false, -1, 'DEFAULT_ACTION');
    }

    if (IsPlayerFreeAiming(playerId)) {
      if (!viewModeReset && IsPedInAnyVehicle(ped, false)) {
        const currentViewMode = GetFollowVehicleCamViewMode();
        if (currentViewMode !== 4) {
          previousViewMode = currentViewMode;
          SetFollowVehicleCamViewMode(4);
          viewModeReset = true;
        }
      }

      if (!reticleEnabled) {
        reticleEnabled = true;
        showReticle(true);
      }

      if (!isFreeAiming) {
        emit('weapons:startedFreeAiming', currentWeaponData);
      }

      isFreeAiming = true;
    } else {
      if (viewModeReset && IsPedInAnyVehicle(ped, false)) {
        SetFollowVehicleCamViewMode(previousViewMode);
        viewModeReset = false;
      }

      if (reticleEnabled) {
        reticleEnabled = false;
        showReticle(false);
      }

      if (isFreeAiming) {
        emit('weapons:stoppedFreeAiming', currentWeaponData);
      }

      isFreeAiming = false;
    }

    SetWeaponsNoAutoswap(true);
    SetPedCanSwitchWeapon(ped, false);
    DisplayAmmoThisFrame(true);

    if (ammoInWeapon === 1 && !currentWeaponData.oneTimeUse) {
      DisablePlayerFiring(ped, true);
    }

    DisableControlAction(1, 140, true);
    DisableControlAction(1, 141, true);
    DisableControlAction(1, 142, true);

    previousAmmoCount = ammoInWeapon;
  }, 1);
};
