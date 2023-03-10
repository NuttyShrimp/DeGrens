class Sync {
  executeNative<T extends keyof Sync.Natives>(native: T, entity: number, ...args: Sync.Natives[T]) {
    global.exports['dg-sync'].syncExecution(native, entity, ...args);
  }

  public setPlayerInvincible = (src: number, isEnabled: boolean): Promise<void> => {
    return global.exports['dg-auth'].setPlayerInvincible(src, isEnabled);
  };
  public setPlayerVisible = (src: number, isVisible: boolean): Promise<void> => {
    return global.exports['dg-auth'].setPlayerVisible(src, isVisible);
  };

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
