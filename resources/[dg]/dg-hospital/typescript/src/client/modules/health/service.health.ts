import { HUD, Notifications, Util } from '@dgx/client';
import { checkDeathOnDamage } from 'modules/down/service.down';
import { BLEED_DAMAGE_TYPES, BONES } from './constants.health';
import { applyScreenBlur } from './helpers.health';

let bleedAmount = 0;
let bleedThread: NodeJS.Timer | null = null;

let bleedingPrevented = false;
let bleedPreventTimeout: NodeJS.Timeout | null = null;

let movementOverrideClearTime = 0;
let movementOverrideThread: NodeJS.Timer | null = null;

const bleedDamageTypes: Set<number> = new Set();

export const loadBleedDamageTypes = (damageTypes: Hospital.Config['damagetypes']) => {
  for (const [name, data] of Object.entries(damageTypes)) {
    if (BLEED_DAMAGE_TYPES.includes(data.status)) {
      bleedDamageTypes.add(GetHashKey(name) >>> 0);
    }
  }
};

export const registerBleedHudIcon = () => {
  HUD.addEntry('bleed', 'droplet', '#AF120A', () => Math.round(bleedAmount), 2, 100, false);
};
export const removeBleedHudIcon = () => {
  HUD.removeEntry('bleed');
};

export const getBleedAmount = () => bleedAmount;

/**
 * @param amount Value gets clamped 0 - 100
 */
export const setBleedAmount = (amount: number) => {
  const wasNoBleeding = bleedAmount === 0;

  bleedAmount = Math.min(100, Math.max(0, amount));

  if (wasNoBleeding && bleedAmount > 0) {
    Notifications.add('Je bent aan het bloeden!', 'info');
  }

  const isBleeding = bleedAmount !== 0;
  HUD.toggleEntry('bleed', isBleeding);

  if (isBleeding) {
    startBleedThread();
  } else {
    if (bleedThread !== null) {
      clearInterval(bleedThread);
      bleedThread = null;
    }
  }
};

export const temporarilyPreventBleeding = (duration: number) => {
  if (bleedPreventTimeout !== null) {
    clearTimeout(bleedPreventTimeout);
  }

  bleedingPrevented = true;
  bleedPreventTimeout = setTimeout(() => {
    bleedingPrevented = false;
  }, duration * 1000);
};

const startBleedThread = () => {
  if (bleedThread !== null) return;

  bleedThread = setInterval(() => {
    if (bleedAmount === 0) return;

    // Each second 20% of bloodamounts gets subtracted from health
    const healthDecrease = Math.max(1, Math.floor(bleedAmount * 0.05));
    const health = getHealth();
    if (health <= 0) return; // So we dont trigger downCheck
    setHealth(health - healthDecrease);
  }, 1000);
};

// When player receives damage one of these things can happen:
// Headshot: Short blur effect
// Upperbody: Bleedamount increase between 5 and 10 for certain weapons
// Lowerbody: 5 Second decrease in movement speed
export const processDamage = (weaponHash: number) => {
  const ped = PlayerPedId();
  const [_, bone] = GetPedLastDamageBone(ped);
  const areaDamaged = BONES[bone] ?? 'UPPERBODY';

  switch (areaDamaged) {
    case 'HEAD':
      applyScreenBlur();
      break;
    case 'UPPERBODY':
      if (bleedDamageTypes.has(weaponHash) && !bleedingPrevented) {
        const amount = Util.getRndInteger(3, 8);
        setBleedAmount(bleedAmount + amount);
      }
      break;
    case 'LOWERBODY':
      startTemporaryMovementOverride();
      break;
  }
};

const startTemporaryMovementOverride = () => {
  movementOverrideClearTime = GetGameTimer() + 2000;

  if (movementOverrideThread !== null) return;

  movementOverrideThread = setInterval(() => {
    if (GetGameTimer() > movementOverrideClearTime) {
      if (movementOverrideThread !== null) {
        clearInterval(movementOverrideThread);
        movementOverrideThread = null;
      }
      return;
    }

    SetPedMoveRateOverride(PlayerPedId(), 0.8);
  }, 1);
};

/**
 * @param health 0-100 (inclusive)
 */
export const setHealth = (health: number, unconscious = false) => {
  const processedAmount = Math.round(Math.min(100, Math.max(0, health)));
  let nativeAmount = 99 + processedAmount;
  if (nativeAmount >= 199) nativeAmount = 200;
  const ped = PlayerPedId();
  SetEntityHealth(ped, nativeAmount);

  if (nativeAmount < 100) {
    const deadHash = unconscious ? GetHashKey('SCRIPT_WISE_UNCONSCIOUS') : GetHashKey('SCRIPT_WISE_DOWN');
    checkDeathOnDamage(0, deadHash >>> 0);
  }
};

/**
 * @returns 0-100 (inclusive)
 */
export const getHealth = () => {
  const ped = PlayerPedId();
  const nativeAmount = GetEntityHealth(ped);
  let health = Math.min(100, nativeAmount - 99);
  if (nativeAmount === 0) health = 0;
  return health;
};
