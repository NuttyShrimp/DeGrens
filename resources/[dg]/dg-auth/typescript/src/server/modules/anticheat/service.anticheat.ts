import { Admin, Config, Events, Hospital, RPC, SQL, Sync, Util, Weapons } from '@dgx/server';
import { mainLogger } from '../../sv_logger';

let blockedWeaponHashes: number[] = [];
const alwaysAllowedWeapons: Set<number> = new Set();
let config: AntiCheat.Config;
const allowedAC: Record<number, string[]> = {};
const pendingAllowedMods: Record<number, { mod: string; allowed: boolean; id: string }[]> = {};

const trackedFlags: Record<string, { reason: string; data?: any; timeStamp: string }[]> = {};

const queuedShots: Record<string, number[]> = {};
const workingShotQueues: Set<string> = new Set();

const queuedHits: Record<string, AntiCheat.EntityDamage[]> = {};
const workingHitQueues: Set<string> = new Set();

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig<AntiCheat.Config>('anticheat');
  blockedWeaponHashes = config.blockedModels.map(m => GetHashKey(m) >>> 0);

  config.alwaysAllowedWeapons.forEach(weapon => {
    const hash = typeof weapon === 'string' ? GetHashKey(weapon) : weapon;
    alwaysAllowedWeapons.add(hash >>> 0);
  });
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
const FLAG_TO_WHITELIST: Record<string, string> = {
  visible: 'invisible',
  invincible: 'invincible',
};

export const flagUser = (src: number, flag: string, data?: any) => {
  if (FLAG_TO_WHITELIST[flag] && allowedAC[src].includes(FLAG_TO_WHITELIST[flag])) {
    return;
  }
  if (!trackedFlags[src]) {
    trackedFlags[src] = [];
  }
  trackedFlags[src].push({
    reason: flag,
    data,
    timeStamp: new Date().toLocaleString(),
  });
  mainLogger.info(`Flagged ${Util.getName(src)}(${src}) for ${flag}`);
  Util.Log(
    'anticheat:flag',
    {
      currentFlags: trackedFlags[src],
    },
    `${Util.getName(src)} was flagged for ${flag}`,
    src
  );
  if (trackedFlags[src].length >= 5) {
    Admin.ACBan(src, 'Flagged anticheat', { flag });
  }
};
// endregion

// region Validators
export const validateWeaponInfo = async (src: number, info: AntiCheat.WeaponInfo) => {
  const valid = await RPC.execute('auth:anticheat:confirmWeaponInfo', src, info);
  if (!valid) {
    Events.emitNet('auth:anticheat:forceSyncWeaponInfo', src);
    return;
  }

  const hasAlwaysAllowedWeapon = alwaysAllowedWeapons.has(info.weapon);

  const ped = GetPlayerPed(String(src));
  const pedAttachedWeapon = GetSelectedPedWeapon(ped) >>> 0;
  // Surely da Jens zn code wel goed is
  if (Hospital.isDown(src)) return;
  if (!hasAlwaysAllowedWeapon && !alwaysAllowedWeapons.has(pedAttachedWeapon) && pedAttachedWeapon != info.weapon) {
    Admin.ACBan(src, 'Weapon mismatch (native)', {
      attachedWeapon: pedAttachedWeapon,
      weaponInfo: info,
    });
    return;
  }

  const scriptWeapon = Weapons.getPlayerEquippedWeapon(src);
  if (!hasAlwaysAllowedWeapon && scriptWeapon != info.weapon) {
    Admin.ACBan(src, 'Weapon mismatch (script)', {
      scriptWeapon: scriptWeapon,
      weaponInfo: info,
    });
    return;
  }

  if (blockedWeaponHashes.includes(info.weapon)) {
    Admin.ACBan(src, 'Blocked weapon equipped', {
      weaponInfo: info,
    });
    return;
  }

  const svDamageModifier = GetPlayerWeaponDamageModifier(String(src));

  // if modifier gotten from client is not 1 or 0, insta ban
  if (info.damageModifier !== 1 && info.damageModifier !== 0) {
    Admin.ACBan(src, 'Weapon damage modifier modification (client)', {
      damageModifier: svDamageModifier,
      weaponInfo: info,
    });
    return;
  }

  if (info.damageModifier !== svDamageModifier) {
    Util.Log(
      'anticheat:damageModifier',
      {
        damageModifier: svDamageModifier,
        weaponInfo: info,
      },
      `${Util.getName(src)}(${src}) client damage modifier is not same as servermodifier`,
      src,
      true
    );
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
  const missingMods = allowedMods.filter(
    mod => !allowedAC[src].includes(mod) && !pendingAllowedMods[src]?.find(pm => pm.mod === mod && !pm.allowed)
  );
  flagUser(src, 'ped-flags', missingMods);
  missingMods.forEach(mod => toggleAllowedMod(src, mod, false));
};

// region Wrapped Natives
export const toggleAllowedMod = async (src: number, mod: string, isAllowed: boolean) => {
  if (!allowedAC[src]) {
    allowedAC[src] = [];
  }
  if (isAllowed && allowedAC[src].includes(mod)) return;
  if (!isAllowed && !allowedAC[src].includes(mod)) return;
  if (isAllowed) {
    allowedAC[src].push(mod);
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
};

// for next two functions:
// when enabling, we first allow before actually doing action
// when disabling, we first do action before dissallowing
// this is to avoid false flags because of latency
export const setPlayerInvincible = async (src: number, isEnabled: boolean) => {
  if (!isEnabled) {
    const ping = GetPlayerPing(String(src));
    SetPlayerInvincible(String(src), false);
    // Sync delay
    await Util.Delay(ping);
  }

  await toggleAllowedMod(src, 'invincible', isEnabled);

  if (isEnabled) {
    SetPlayerInvincible(String(src), true);
  }
};
export const setPlayerVisible = async (src: number, isVisible: boolean) => {
  if (isVisible) {
    const ping = GetPlayerPing(String(src));
    await RPC.execute('auth:anticheat:setVisible', src, true);
    // Sync delay
    await Util.Delay(ping);
  }

  await toggleAllowedMod(src, 'invisible', !isVisible);

  if (!isVisible) {
    await RPC.execute('auth:anticheat:setVisible', src, false);
  }
};
// endregion

// region Explosions
export const registerExplosion = (src: number, ev: AntiCheat.ExplosionEventInfo) => {
  Util.Log(
    'anticheat:explosion',
    {
      ...ev,
      isBlocked: config.explosions[ev.explosionType]?.block ?? true,
      name: config.explosions[ev.explosionType]?.name ?? 'Unknown Explosion',
    },
    `Registered an explosion from ${Util.getName(src)}(${src})`,
    src
  );
  return config.explosions[ev.explosionType]?.block ?? true;
};
// endregion

// region Stats
export const queueShot = async (src: number, ammo: number[]) => {
  const steamId = Player(src).state.steamId;
  if (!queuedShots[steamId]) {
    queuedShots[steamId] = [];
  }
  const shotsFired = travereseAmmo(ammo);
  queuedShots[steamId].push(shotsFired);
  if (workingShotQueues.has(steamId)) return;
  workingShotQueues.add(steamId);
  pushShotQueue(steamId);
};

const travereseAmmo = (ammo: number[]) => {
  let shotsFired = 0;
  while (ammo.length !== 0) {
    const startAmmo = ammo[0];
    let idx = 0;
    while (ammo?.[idx] !== undefined && startAmmo >= ammo[idx]) {
      idx++;
    }
    ammo = ammo.slice(idx);
    shotsFired += idx;
  }
  return shotsFired;
};

const pushShotQueue = async (steamId: string) => {
  while (queuedShots?.[steamId].length) {
    let entry = queuedShots[steamId].shift()!;
    const records = await SQL.query<{ shots: number }[]>('SELECT shots FROM user_kill_stats WHERE steamid = ?', [
      steamId,
    ]);
    entry += records?.[0]?.shots ?? 0;
    await SQL.query(
      `
                    INSERT INTO user_kill_stats (steamid, shots) VALUES
                      (?, ?)
                    ON DUPLICATE KEY UPDATE shots = ?`,
      [steamId, entry, entry]
    );
  }
  workingShotQueues.delete(steamId);
};

export const queueHit = (killInfo: AntiCheat.EntityDamage) => {
  killInfo.attacker = Player(killInfo.attacker).state.steamId;
  killInfo.victim = Player(killInfo.victim).state.steamId;
  if (!queuedHits[killInfo.attacker]) {
    queuedHits[killInfo.attacker] = [];
  }
  queuedHits[killInfo.attacker].push(killInfo);
  if (workingHitQueues.has(killInfo.attacker as string)) return;
  workingHitQueues.add(killInfo.attacker as string);
  pushHitQueue(killInfo.attacker as string);
};

const pushHitQueue = async (steamId: string) => {
  while (queuedHits?.[steamId].length) {
    const entry = queuedHits[steamId].shift()!;
    await registerHit(steamId, entry);
  }
  workingHitQueues.delete(steamId);
};

const registerHit = async (steamId: string, killInfo: AntiCheat.EntityDamage) => {
  const records = await SQL.query<{ headshots: number; kills: number }[]>(
    'SELECT headshots, kills FROM user_kill_stats WHERE steamid = ?',
    [steamId]
  );
  const kills = (records?.[0]?.kills ?? 0) + 1;
  let headshots = records?.[0]?.headshots ?? 0;
  if (killInfo.headshot) {
    headshots += 1;
  }
  await SQL.query(
    `
                    INSERT INTO user_kill_stats (steamid, kills, headshots) VALUES
                      (?, ?, ?)
                    ON DUPLICATE KEY UPDATE kills = ?, headshots = ?`,
    [steamId, kills, headshots, kills, headshots]
  );
};
// endregion
