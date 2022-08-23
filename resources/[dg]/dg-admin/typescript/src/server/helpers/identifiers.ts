import { Util } from '@dgx/server';

export const getIdentifierForPlayer = (source: number, identifier: string) => {
  const src = String(source);
  const identifierNum = GetNumPlayerIdentifiers(src);
  for (let i = 0; i < identifierNum; i++) {
    const id = GetPlayerIdentifier(src, i);
    if (id.startsWith(identifier)) {
      return id;
    }
  }
};

export const getUserData = (src: number): UserData => {
  return {
    steamId: getIdentifierForPlayer(src, 'steam'),
    source: src,
    name: GetPlayerName(String(src)),
    cid: Util.getCID(src),
  };
};

export const getPlayerForSteamId = (steamId: string): UserData | null => {
  const ply = Object.values(DGCore.Functions.GetQBPlayers()).find((ply: Player) => ply.PlayerData.steamid === steamId);
  if (!ply) return null;
  return getUserData(ply.PlayerData.source);
};
