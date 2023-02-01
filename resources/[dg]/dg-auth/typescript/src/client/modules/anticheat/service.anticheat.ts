import { Events, Util } from '@dgx/client';
import { StatsThread } from './classes/StatsThread';

let allowed: string[] = [];

// threads
let allowedSync: NodeJS.Timeout | null = null;
let heartbeat: NodeJS.Timeout | null = null;
let antiTP: NodeJS.Timer;
let weapons: NodeJS.Timeout | null = null;
let pedMods: NodeJS.Timeout | null = null;
let statsThread: StatsThread;

export const scheduleHeartBeat = () => {
  if (heartbeat) stopHeartBeat();
  Events.emitNet('auth:heartbeat');
  heartbeat = setTimeout(() => {
    scheduleHeartBeat();
  }, 180000);
};

export const stopHeartBeat = () => {
  if (heartbeat === null) return;
  clearTimeout(heartbeat);
  heartbeat = null;
};

// region collectors
export const getWeaponInfo = (): AntiCheat.WeaponInfo => {
  const ped = PlayerPedId();
  const equippedWeapon = GetSelectedPedWeapon(ped) >>> 0;
  const weaponAmmoType = GetPedAmmoTypeFromWeapon(ped, equippedWeapon);
  const ammoInWeapon = GetPedAmmoByType(ped, weaponAmmoType);
  return {
    weapon: equippedWeapon,
    ammo: ammoInWeapon,
    damageModifier: GetPlayerWeaponDamageModifier(PlayerId()),
  };
};
// endregion

// region Check whitelisting
export const allowCheck = (check: string) => {
  if (!allowed.includes(check)) {
    allowed.push(check);
    Util.debug(`Anticheat: allowed ${check}`);
  }
};

export const disallowCheck = (check: string) => {
  allowed = allowed.filter(m => m !== check);
  Util.debug(`Anticheat: declined ${check}`);
};

const scheduleAllowedSync = () => {
  if (allowedSync) {
    clearTimeout(allowedSync);
    allowedSync = null;
  }
  allowedSync = setTimeout(() => {
    Events.emitNet('auth:anticheat:syncAllowedModules', allowed);
  }, 5000);
};
// endregion

// region Checks

// TODO: Should take drugeffects in count
const scheduleAntiTP = () => {
  if (antiTP) return;
  antiTP = setInterval(() => {
    const ped = PlayerPedId();
    let speed = GetEntitySpeed(ped);
    const inVeh = IsPedInAnyVehicle(ped, false);
    if (inVeh) {
      speed = GetEntitySpeed(GetVehiclePedIsIn(ped, false));
    }
    const jumping = IsPedJumping(ped);
    const ragdoll = IsPedRagdoll(ped);
    const falling = IsPedFalling(ped);
    const onVeh = IsPedOnVehicle(ped);
    const inNoclip = global.exports?.['dg-admin']?.inNoclip() ?? false;
    const speedDrug = global.exports?.['dg-misc']?.isOnDrugs('speed') ?? false;
    // TODO: check distance between coords
    if (!inNoclip) {
      if (!inVeh && !onVeh) {
        if (!jumping && !falling && !ragdoll && !speedDrug) {
          if (speed > 10) {
            Events.emitNet('auth:anticheat:addFlag', 'speed');
          }
        }
      } else {
        if (speed > 90) {
          Events.emitNet('auth:anticheat:addFlag', 'speed');
        }
      }
    }
  }, 1000);
};

export const scheduleWeaponThread = () => {
  if (weapons) {
    clearTimeout(weapons);
    weapons = null;
  }
  const info = getWeaponInfo();
  Events.emitNet('auth:anticheat:weaponCheck', info);
  weapons = setTimeout(() => {
    scheduleWeaponThread();
  }, 30000);
};

export const startStatThread = () => {
  statsThread.startThread();
};

export const stopStatsThread = () => {
  statsThread.stopThread();
};

export const schedulePedThread = () => {
  if (pedMods) {
    clearTimeout(pedMods);
    pedMods = null;
  }

  // Disable GTA's built-in aim assist
  SetPlayerTargetingMode(3);

  pedMods = setInterval(() => {
    const inNoclip = global.exports['dg-admin'].inNoclip();
    const ped = PlayerPedId();
    if (!inNoclip) {
      if (GetEntityAlpha(ped) !== 255) {
        Events.emitNet('auth:anticheat:addFlag', 'alpha');
        SetEntityAlpha(ped, 255, true);
      }
      if (!IsEntityVisible(ped) && !allowed.includes('invisible')) {
        SetEntityVisible(ped, true, true);
        Events.emitNet('auth:anticheat:addFlag', 'visible');
      }
      if (GetPlayerInvincible(ped) && !allowed.includes('invincible')) {
        SetEntityInvincible(ped, false);
        Events.emitNet('auth:anticheat:addFlag', 'invincible');
      }
    }
    if (GetLocalPlayerAimState() !== 3) {
      Events.emitNet('auth:anticheat:addFlag', 'aim-assist');
    }
  }, 1000);
};

export const startThreads = () => {
  scheduleAntiTP();
  scheduleWeaponThread();
  schedulePedThread();
  scheduleAllowedSync();
  statsThread = new StatsThread();
};

export const cleanup = () => {
  [antiTP, weapons, pedMods, allowedSync].forEach(thread => {
    if (thread) {
      clearInterval(thread);
      thread = null;
    }
  });
  statsThread.stopThread();
};
// endregion
// endregion
