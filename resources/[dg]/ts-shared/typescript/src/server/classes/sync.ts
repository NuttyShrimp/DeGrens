class Sync {
  executeNative(native: string, entity: number, ...args: any[]) {
    global.exports['dg-sync'].syncExecution(native, entity, ...args);
  }
  setPlayerInvincible(src: number, isEnabled: boolean) {
    global.exports['dg-auth'].SetPlayerInvincible(src, isEnabled);
  }
  setPlayerVisible(src: number, isVisible: boolean) {
    global.exports['dg-auth'].SetPlayerVisible(src, isVisible);
  }

  public getPlayerScope = (plyId: number): { current: Sync.ScopePlayer[]; recent: Sync.ScopePlayer[] } => {
    return global.exports['dg-sync'].getPlayerScope(plyId);
  };

  public getAmountOfPlayers = () => {
    return GetNumPlayerIndices();
  };
}

export default {
  Sync: new Sync(),
};
