import { Core, Util } from '@dgx/server';

export const getIdentifierForPlayer = (source: number, identifier: string) => {
  const userModule = Core.getModule('users');
  return userModule.getPlyIdentifiers(source)[identifier];
};

export const getUserData = (src: number): UserData => {
  return {
    steamId: getIdentifierForPlayer(src, 'steam')!,
    source: src,
    name: GetPlayerName(String(src)),
    cid: Util.getCID(src, true),
  };
};

export const getServerIdForSteamId = (steamId: string) => {
  const playerCount = GetNumPlayerIndices();
  for (let i = 0; i < playerCount; i++) {
    const srvId = Number(GetPlayerFromIndex(i));
    if (getIdentifierForPlayer(srvId, 'steam') === steamId) {
      return srvId;
    }
  }
};

export const getPlayerForSteamId = (steamId: string): UserData | null => {
  const userModule = Core.getModule('users');
  const ply = userModule.getServerIdFromIdentifier('steam', steamId);
  if (!ply) return null;
  return getUserData(ply);
};
