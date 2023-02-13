import { Config, RPC, SQL, Util } from '@dgx/server';

import { checkBinds } from '../menu/service.menu';

import { permissionLogger } from './util.permissions';

let roles: Permissions.Role[] = [];
// Map of steamIds to role Names
const playerRoles: Map<string, string> = new Map();

// region Loaders
export const loadRoles = (pRoles: Permissions.Role[]) => {
  if (!pRoles) return;
  roles = pRoles;
  permissionLogger.debug(`Loaded ${roles.length} roles`);
};

export const loadPlayerRoles = async () => {
  await Config.awaitConfigLoad();
  const results = await SQL.query<Permissions.PlayerRole[]>('SELECT * FROM permissions');
  if (!results) return;
  results.forEach(result => {
    playerRoles.set(result.steamid, result.role);
  });
  permissionLogger.debug(`Loaded ${playerRoles.size} player roles`);
};
// endregion

export const hasRoleAccess = (sourceRole: string, targetRole: string): boolean => {
  if (!sourceRole || !targetRole) return false;
  const sourceRolePower = roles.find(role => role.name === sourceRole)?.power;
  if (!sourceRolePower) permissionLogger.warn(`Tried to get role power of non existent role: ${sourceRole}`);
  const targetRolePower = roles.find(role => role.name === targetRole)?.power;
  if (!targetRolePower) permissionLogger.warn(`Tried to get role power of non existent role: ${targetRole}`);
  return (sourceRolePower ?? 0) >= (targetRolePower ?? 0);
};

export const hasSteamIdPermission = (steamId: string, targetRole: string): boolean => {
  const role = playerRoles.get(steamId) ?? 'user';
  return hasRoleAccess(role, targetRole);
}

// permissions is the name of a role. We work with inheritance
export const hasPlayerPermission = (src: number, targetRole: string): boolean => {
  const steamId = Player(src).state.steamId;
  if (!steamId) return false;
  return hasSteamIdPermission(steamId, targetRole);
};

export const getPlayerRole = (src: number): string => {
  const steamId = Player(src).state.steamId;
  if (!steamId) return 'user';
  return playerRoles.get(steamId) ?? 'user';
};

// These functions should never be put behind an event
export const setPlayerPermission = async (src: number, targetRole: string) => {
  const steamId = Player(src).state.steamId;
  if (!steamId) return;
  await SQL.query(
    `
      INSERT INTO permissions (name, steamId, role)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE role = ?
    `,
    [GetPlayerName(String(src)), steamId, targetRole, targetRole]
  );
  const oldRole = playerRoles.get(steamId) ?? 'user';
  playerRoles.set(steamId, targetRole);
  permissionLogger.info(`Role of ${GetPlayerName(String(src))} was changed to ${targetRole}`);
  Util.Log(
    'admin:permission:set',
    {
      role: targetRole,
      oldRole,
    },
    `${GetPlayerName(String(src))} role was changed to ${targetRole}`,
    src
  );
  global.exports['dg-chat'].refreshCommands(src);
  const binds = await RPC.execute('admin:menu:getBinds', src);
  if (!binds) return;
  checkBinds(src, binds);
};

export const canPlayerBeAFK = (src: number) => {
  const steamId = Player(src).state.steamId;
  if (!steamId) return false;
  const role = playerRoles.get(steamId) ?? 'user';
  return roles.find(r => r.name === role)?.allowAFK ?? false;
};
