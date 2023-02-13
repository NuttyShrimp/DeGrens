import { Admin, Jobs } from "@dgx/server"

export const getRolesForPlayer = async (steamId: string): Promise<APIInfo.PlayerRoles> => {
  return {
    developer: Admin.hasSteamIdPermission(steamId, 'developer'),
    staff: Admin.hasSteamIdPermission(steamId, 'staff'),
    police: await Jobs.isUserWhitelisted(steamId, 'police'),
    ambulance: await Jobs.isUserWhitelisted(steamId, 'ambulance')
  } 
}

export const getRoleListForPlayer = async (steamId: string): Promise<APIInfo.PlayerRole[]> => {
  const perms = Object.entries(await getRolesForPlayer(steamId));
  return perms.map(([v, k], l) => {
    return k ? v : null;
  }).filter(v => v) as APIInfo.PlayerRole[];
}
