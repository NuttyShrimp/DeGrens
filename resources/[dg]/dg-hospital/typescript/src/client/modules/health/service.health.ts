import { Events, HUD, Util } from '@dgx/client';
import { checkDeathOnDamage } from 'modules/down/service.down';
import { BLEED_DAMAGE_TYPES, BONES } from './constants.health';
import { applyScreenBlur } from './helpers.health';

let bleedAmount = 0;
let bleedThread: NodeJS.Timer | null = null;

let movementOverrideClearTime = 0;
let movementOverrideThread: NodeJS.Timer | null = null;

const bleedDamageTypes: Set<number> = new Set();

export const loadBleedDamageTypes = (damageTypes: Hospital.Config['damagetypes']) => {
  for (const [name, data] of Object.entries(damageTypes)) {
    if (BLEED_DAMAGE_TYPES.includes(data.status)) {
      bleedDamageTypes.add(Util.getHash(name));
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
  bleedAmount = Math.min(100, Math.max(0, amount));

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

const startBleedThread = () => {
  if (bleedThread !== null) return;

  bleedThread = setInterval(() => {
    if (bleedAmount === 0) return;

    // Each second 20% of bloodamounts gets subtracted from health
    const healthDecrease = Math.max(1, Math.floor(bleedAmount * 0.2));
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
      if (bleedDamageTypes.has(weaponHash)) {
        const amount = Util.getRndInteger(5, 10);
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
  const ped = PlayerPedId();
  let nativeAmount = 99 + processedAmount;
  if (nativeAmount >= 199) nativeAmount = 200;
  SetEntityHealth(ped, nativeAmount);
  checkDeathOnDamage(0, unconscious ? Util.getHash('SCRIPT_WISE_UNCONSCIOUS') : Util.getHash('SCRIPT_WISE_DOWN'));
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
