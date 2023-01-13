import { Util } from '@dgx/server';

const scopes: Map<number, Scopes.Scope> = new Map();

const getPlayerInfo = (plyId: number): Scopes.Player => ({
  source: plyId,
  steamId: Player(plyId).state.steamId,
});

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

  const scopePlayer: Scopes.Info | undefined = scope[playerEntering];

  // If already known, change info
  if (scopePlayer) {
    // If player was known because he left, cancel timeout
    if (scopePlayer.recentTimeout) {
      clearTimeout(scopePlayer.recentTimeout);
      scopePlayer.recentTimeout = undefined;
    }

    scopePlayer.type = 'current';
    scopePlayer.timestamp = Date.now();
  } else {
    scope[playerEntering] = {
      type: 'current',
      timestamp: Date.now(),
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

  const scopePlayer: Scopes.Info | undefined = scope[playerLeaving];

  // If already known, change info
  if (scopePlayer) {
    scopePlayer.recentTimeout = timeout;
    scopePlayer.type = 'recent';
    scopePlayer.timestamp = Date.now();
  } else {
    scope[playerLeaving] = {
      type: 'recent',
      timestamp: Date.now(),
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
      scope[droppedPlayer].timestamp = Date.now();
    }
  }

  // Chance of player reconnecting within 30 sec is 0 so dont need to be able to cancel
  setTimeout(() => {
    for (const [_, scope] of scopes) {
      delete scope[droppedPlayer];
    }
  }, 30000);
};

// Returns obj with client types array sorted by timestamp
export const getPlayerScope = (plyId: number) => {
  const scope = getScope(plyId);

  Util.Log('sync:getScope', { scope }, `${Util.getName(plyId)} received his scope for idmenu`, plyId);

  const scopeInfo: Record<Scopes.ClientType, Scopes.Player[]> = {
    current: [],
    recent: [],
  };

  for (const info of Object.values(scope)) {
    const type: Scopes.ClientType = info.type === 'current' ? 'current' : 'recent';
    scopeInfo[type].push({ source: info.source, steamId: info.steamId });

    // sort newest first
    scopeInfo[type].sort((a, b) => scope[b.source].timestamp - scope[a.source].timestamp);
  }

  return scopeInfo;
};
