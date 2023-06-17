import { Events, Util } from './index';

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

  public getPlayerScope = (plyId: number): Sync.Scopes.PlayerScope => {
    return global.exports['dg-sync'].getPlayerScope(plyId);
  };

  public getAmountOfPlayers = () => {
    return GetNumPlayerIndices();
  };

  public getPlayerCoords = (plyId: number): Vec3 | undefined => {
    return global.exports['dg-sync'].getPlayerCoords(plyId);
  };

  show3dText = (origin: number, msg: string) => {
    const senderCoords = Util.getPlyCoords(origin);
    Util.getAllPlayers().forEach(player => {
      const plyCoords = Util.getPlyCoords(player);
      const shouldShow = senderCoords.subtract(plyCoords).Length <= 25;
      if (!shouldShow) return;
      Events.emitNet('misc:synced3dtext:add', player, origin, msg);
    });
  };
}

export default {
  Sync: new Sync(),
};
