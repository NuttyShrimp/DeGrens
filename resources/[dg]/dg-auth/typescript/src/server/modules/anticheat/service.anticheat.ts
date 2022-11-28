import { Admin, Config, Events, RPC, Sync, Util } from '@dgx/server';
import { timeStamp } from 'console';
import { mainLogger } from '../../sv_logger';

let blockedWeaponHashes: number[] = [];
let config: AntiCheat.Config;
const allowedAC: Record<number, string[]> = {};
const pendingAllowedMods: Record<number, { mod: string, allowed: boolean, id: string }[]> = {};

const trackedFlags: Record<string, { reason: string, data?: any, timeStamp: string }[]> = {};

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig<AntiCheat.Config>('anticheat');
  blockedWeaponHashes = config.blockedModels.map(GetHashKey);
};

// region Heartbeat
const beats: Record<number, NodeJS.Timeout> = {};

export const registerHeartBeat = (src: number) => {
  if (beats[src]) {
    clearTimeout(beats[src]);
  }
  mainLogger.debug(`received heartbeat from ${src}`);
  beats[src] = setTimeout(() => {
    Admin.ACBan(src, 'Failed to receive heartbeat');
  }, 4.5 * 60 * 1000);
};

export const stopHeartBeat = (src: number) => {
  clearTimeout(beats[src]);
  delete beats[src];
};
// endregion

// region Flags
export const flagUser = (src: number, flag: string, data?: any) => {
  if (!trackedFlags[src]) {
    trackedFlags[src] = [];
  }
  trackedFlags[src].push({
    reason: flag,
    data,
    timeStamp: new Date().toLocaleString(),
  })
  Util.Log("anticheat:flag", {
    currentFlags: trackedFlags[src]
  }, `${Util.getName(src)} was flagged for ${flag}`, src);
  if (trackedFlags[src].length >= 3) {
    Admin.ACBan(src, "Flagged anticheat");
    return;
  }
}
// endregion

// region Validators
export const validateWeaponInfo = (src: number, info: AntiCheat.WeaponInfo) => {
  const valid = RPC.execute('auth:anticheat:confirmWeaponInfo', src, info);
  if (!valid) {
    Events.emitNet('auth:anticheat:forceSyncWeaponInfo', src);
    return;
  }
  const ped = GetPlayerPed(String(src));
  const pedAttachedWeapon = GetSelectedPedWeapon(ped);
  if (pedAttachedWeapon != info.weapon) {
    Admin.ACBan(src, 'Weapon mismatch (native)');
    return;
  }
  const scriptWeapon = global.exports['dg-weapons'].getPlayerEquippedWeapon(src);
  if (scriptWeapon != info.weapon) {
    Admin.ACBan(src, 'Weapon mismatch (script)');
    return;
  }
  if (blockedWeaponHashes.includes(info.weapon)) {
    Admin.ACBan(src, 'Blocked weapon equipped');
    return;
  }
  // TODO: do something with the ammo
  const svDamageModifier = GetPlayerWeaponDamageModifier(String(src));
  if (info.damageModifier !== svDamageModifier) {
    Admin.ACBan(src, 'Weapon damage modifier modification');
    return;
  }
};
// endregion

export const checkAllowedModules = (src: number, allowedMods: string[]) => {
  if (!allowedAC[src]) {
    allowedAC[src] = [];
  }
  if (allowedMods.every(mod => allowedAC[src].includes(mod))) return;
  // Mods a player has defined on the client but not on the server
  const missingMods = allowedMods.filter(mod => !allowedAC[src].includes(mod) && !pendingAllowedMods[src]?.find(pm => pm.mod === mod && !pm.allowed));
  flagUser(src, "ped-flags", missingMods);
  missingMods.forEach(mod => toggleAllowedMod(src, mod, false))
}

// region Wrapped Natives
const toggleAllowedMod = async (src: number, mod: string, isAllowed: boolean) => {
  if (!allowedAC[src]) {
    allowedAC[src] = [];
  }
  if (isAllowed && allowedAC[src].includes(mod)) return;
  if (!isAllowed && !allowedAC[src].includes(mod)) return;
  if (isAllowed) {
    allowedAC[src].push(mod)
  } else {
    allowedAC[src] = allowedAC[src].filter(m => m !== mod);
  }
  if (!pendingAllowedMods[src]) {
    pendingAllowedMods[src] = [];
  }
  const pendingChangeId = Util.uuidv4();
  pendingAllowedMods[src].push({
    id: pendingChangeId,
    mod,
    allowed: isAllowed,
  });
  await RPC.execute('auth:anticheat:toggleACAllowed', src, mod, isAllowed);
  pendingAllowedMods[src] = pendingAllowedMods[src].filter(pm => pm.id !== pendingChangeId);
}

export const setPlayerInvincible = (src: number, isEnabled: boolean) => {
  toggleAllowedMod(src, 'invincible', isEnabled);
  SetPlayerInvincible(String(src), isEnabled);
}
export const setPlayerVisible = (src: number, isVisible: boolean) => {
  toggleAllowedMod(src, 'invisible', !isVisible);
  Sync.executeNative('SetEntityVisible', src, GetPlayerPed(String(src)), true);
}
// endregion

// region Explosions
export const registerExplosion = (src: number, ev: AntiCheat.ExplosionEventInfo) => {
  Util.Log("anticheat:explosion", {
    ...ev,
    isBlocked: config.explosions[ev.explosionType]?.block ?? true,
    name: config.explosions[ev.explosionType]?.name ?? "Unknown Explosion"
  }, `Registered an explosion from ${Util.getName(src)}(${src})`, src);
  return config.explosions[ev.explosionType]?.block ?? true
}
// endregion

// region Getting/Setting info
export const startThreads = () => { };

export const cleanup = () => { };
// enregion
