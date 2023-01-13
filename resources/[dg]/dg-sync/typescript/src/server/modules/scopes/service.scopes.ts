const scopes: Map<number, Scopes.Scope> = new Map();

const getPlayerInfo = (plyId: number) => {
  return {
    source: plyId,
    steamId: Player(plyId).state.steamId,
  };
};

const getScope = (plyId: number) => {
  let scope = scopes.get(plyId);
  if (!scope) {
    scope = {};
    scopes.set(plyId, scope);
  }
  return scope;
};

export const playerEnteredScope = (player: number, playerEntering: number) => {
  const scope = getScope(player);

  const scopePlayer = scope[playerEntering];
  if (scopePlayer) {
    if (scopePlayer.recentTimeout) {
      clearTimeout(scopePlayer.recentTimeout);
      scopePlayer.recentTimeout = undefined;
    }
    scopePlayer.type = 'current';
  } else {
    scope[playerEntering] = {
      type: 'current',
      ...getPlayerInfo(playerEntering),
    };
  }
};

export const playerLeftScope = (player: number, playerLeaving: number) => {
  const scope = getScope(player);

  // Need to be able to cancel, incase player reenteres scope
  const timeout = setTimeout(() => {
    if (scope[playerLeaving]?.type !== 'recent') return;
    delete scope[playerLeaving];
  }, 30000);

  const scopePlayer = scope[playerLeaving];
  if (scopePlayer) {
    scopePlayer.recentTimeout = timeout;
    scopePlayer.type = 'recent';
  } else {
    scope[playerLeaving] = {
      type: 'recent',
      ...getPlayerInfo(playerLeaving),
    };
  }
};

export const playerDropped = (droppedPlayer: number) => {
  scopes.delete(droppedPlayer);

  // Change type of player, in every scope that has player, to dropped
  for (const [_, scope] of scopes) {
    if (scope[droppedPlayer]) {
      scope[droppedPlayer].type = 'dropped';
    }
  }

  // Chance of player reconnecting within 30 sec is 0 so dont need to be able to cancel
  setTimeout(() => {
    for (const [_, scope] of scopes) {
      delete scope[droppedPlayer];
    }
  }, 30000);
};

export const getPlayerScope = (plyId: number) => {
  const scope = getScope(plyId);

  const scopeInfo: Record<Scopes.Type, Omit<Scopes.Info, 'type' | 'recentTimeout'>[]> = {
    current: [],
    recent: [],
    dropped: [],
  };

  for (const info of Object.values(scope)) {
    scopeInfo[info.type].push({ source: info.source, steamId: info.steamId });
  }

  return scopeInfo;
};
