export const getCurrentEnv = () => process.env.NODE_ENV ?? 'development';

export const getPlySteamId = (src: number) => {
  const steamId = Player(src).state.steamId;
  if (steamId) {
    return steamId;
  }
  const source = String(src);
  const identifier_count = GetNumPlayerIdentifiers(source);
  for (let i = 0; i < identifier_count; i++) {
    const identifier = GetPlayerIdentifier(source, i);
    if (identifier.startsWith('steam:')) {
      Player(src).state.set('steamId', identifier, false);
      return identifier;
    }
  }
  return null;
};

export const getPlyServerId = (steamId: string) => {
  for (let i = 0; i < GetNumPlayerIndices(); i++) {
    const serverId = GetPlayerFromIndex(i);
    const plySteamId = getPlySteamId(Number(serverId));
    if (plySteamId === steamId) {
      return serverId;
    }
  }
};
