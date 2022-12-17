const scopes: Record<number, Record<number, { source: number; steamId: string }>> = {};
const recentLeft: Record<number, any> = {};

export const playerEnteredScope = (player: number, playerEntering: number) => {
  if (!scopes[player]) {
    scopes[player] = {};
  }

  if (recentLeft[player]) {
    delete recentLeft[player][playerEntering];
  }

  scopes[player][playerEntering] = {
    source: playerEntering,
    steamId: Player(playerEntering).state.steamId,
  };
};

export const playerLeftScope = (player: number, playerLeaving: number) => {
  if (!scopes[player]) return;

  const scopeInfo = scopes[player][playerLeaving];
  if (!scopeInfo) return;

  delete scopes[player][playerLeaving];

  if (!recentLeft[player]) {
    recentLeft[player] = {};
  }

  recentLeft[player][playerLeaving] = scopeInfo;

  setTimeout(() => {
    if (!recentLeft[player]) return;
    delete recentLeft[player][playerLeaving];
  }, 30000);
};

export const playerDropped = (droppedPlayer: number) => {
  delete scopes[droppedPlayer];
  delete recentLeft[droppedPlayer];

  for (const table of Object.values(scopes)) {
    if (table[droppedPlayer]) {
      delete table[droppedPlayer];
    }
  }
};

export const getPlayerScope = (plyId: number) => {
  const currentScopeInfo = [];
  if (scopes[plyId]) {
    for (const info of Object.values(scopes[plyId])) {
      currentScopeInfo.push(info);
    }
  }
  const recentScopeInfo = [];
  if (recentLeft[plyId]) {
    for (const info of Object.values(recentLeft[plyId])) {
      recentScopeInfo.push(info);
    }
  }
  return {
    current: currentScopeInfo,
    recent: recentScopeInfo,
  };
};
