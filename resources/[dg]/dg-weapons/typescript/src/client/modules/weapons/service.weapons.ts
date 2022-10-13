import { Events } from '@dgx/client';
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

  weaponThread = setInterval(() => {
    if (currentWeaponData === null) return;

    const ped = PlayerPedId();
    const weapon = currentWeaponData?.hash;
    const ammoInWeapon = Number(GetAmmoInPedWeapon(ped, weapon));

    // Decrease quality while shooting
    if (IsPedShooting(ped) && ammoInWeapon > 0) {
      qualityDecrease++;
    }

    if (IsControlJustReleased(0, 24) || IsDisabledControlJustReleased(0, 24)) {
      Events.emitNet('weapons:server:stoppedShooting', currentWeaponData.id, ammoInWeapon, qualityDecrease);
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
    } else {
      if (viewModeReset && IsPedInAnyVehicle(ped, false)) {
        SetFollowVehicleCamViewMode(previousViewMode);
        viewModeReset = false;
      }

      if (reticleEnabled) {
        reticleEnabled = false;
        showReticle(false);
      }
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
  }, 1);
};
