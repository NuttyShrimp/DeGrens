class Sync {
  public executeAction = (action: string, entity: number, ...args: any[]) => {
    global.exports['dg-sync'].executeAction(action, entity, ...args);
  };

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
