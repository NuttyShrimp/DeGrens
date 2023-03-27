import { Events, Util } from '@dgx/client';
import { showReticle } from './helpers.weapons';

let currentWeaponData: Weapons.WeaponItem | null = null;
let weaponThread: NodeJS.Timer | null = null;

let animationBusy = false;
export const isAnimationBusy = () => animationBusy;
export const setAnimationBusy = (busy: boolean) => {
  animationBusy = busy;
};

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

const startWeaponThread = () => {
  if (!currentWeaponData) return;

  const playerId = PlayerId();

  let reticleEnabled = false;
  let previousViewMode = 1;
  let viewModeReset = false;

  // To emit shot event for GSR
  let shotFired = false;

  // To keep track of shots fired for bullet casings
  // positions get cleared every time we emit saving event
  let previousAmmoCount = Number(GetAmmoInPedWeapon(PlayerPedId(), currentWeaponData.hash));
  let shotFirePositions: Vec3[] = [];

  // needed for checking evidence
  let isFreeAiming = IsPlayerFreeAiming(playerId);

  let stoppedAttackTimeout: NodeJS.Timeout | null = null;

  // diff logic for melee weapons
  let meleeHits = 0;

  // TODO: Find way to modify melee weapon damage using weaponmeta files
  // editting meta damage only works for guns for some reason and i cant find where to modify melee weapon damage
  SetWeaponDamageModifierThisFrame(currentWeaponData.hash, currentWeaponData.damageModifier);

  weaponThread = setInterval(() => {
    if (currentWeaponData === null) return;

    const ped = PlayerPedId();

    SetWeaponsNoAutoswap(true);
    SetPedCanSwitchWeapon(ped, false);
    DisplayAmmoThisFrame(true);

    const weapon = GetSelectedPedWeapon(ped) >>> 0;
    if (weapon !== currentWeaponData.hash) return; // Can happen with big weapons in vehicles

    const ammoInWeapon = Number(GetAmmoInPedWeapon(ped, weapon));

    // Player has fired a bullet
    if (ammoInWeapon < previousAmmoCount) {
      const plyCoords = Util.getEntityCoords(ped);
      shotFirePositions.push(plyCoords);
      emit('weapons:shotWeapon', currentWeaponData);

      if (!shotFired) {
        Events.emitNet('weapons:server:firstShot', currentWeaponData.hash);
        shotFired = true;
      }
    }

    const attackButtonReleased = IsControlJustReleased(0, 24) || IsDisabledControlJustReleased(0, 24);
    const justShot = !currentWeaponData.isMelee && attackButtonReleased;
    const justMeleed =
      currentWeaponData.isMelee &&
      (attackButtonReleased || IsControlJustReleased(0, 140) || IsDisabledControlJustReleased(0, 140));

    // handle player stopped shooting with gun
    if (justShot || justMeleed) {
      SetPedUsingActionMode(ped, false, -1, 'DEFAULT_ACTION');

      if (justMeleed) {
        meleeHits++;
      }

      // Throttle
      if (stoppedAttackTimeout) {
        clearTimeout(stoppedAttackTimeout);
        stoppedAttackTimeout = null;
      }
      // Provide data as params so timeout will still work if we remove weapon during timeout
      stoppedAttackTimeout = setTimeout(
        (weaponId: string) => {
          if (justMeleed) {
            Events.emitNet('weapons:server:meleeHit', weaponId, meleeHits);
            meleeHits = 0;
          } else if (justShot) {
            Events.emitNet('weapons:server:stoppedShooting', weaponId, ammoInWeapon, shotFirePositions);
            shotFirePositions = [];
          }
        },
        1000,
        currentWeaponData.id
      );
    }

    // Player is holding rightclick
    // handle vehicle first person, reticle and free aiming event
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
        if (currentWeaponData.useNativeReticle) {
          global.exports['dg-misc'].setDefaultReticleEnabled(true);
        }
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
        if (currentWeaponData.useNativeReticle) {
          global.exports['dg-misc'].setDefaultReticleEnabled(false);
        }
      }

      if (isFreeAiming) {
        emit('weapons:stoppedFreeAiming', currentWeaponData);
      }

      isFreeAiming = false;
    }

    // Stop player from shooting when player only has 1 bullet
    // Having 0 bullets auto removes the gun (gta behavior) so we cap at 1
    if (ammoInWeapon === 1 && !currentWeaponData.oneTimeUse) {
      DisablePlayerFiring(ped, true);
    }

    previousAmmoCount = ammoInWeapon;
  }, 1);
};
