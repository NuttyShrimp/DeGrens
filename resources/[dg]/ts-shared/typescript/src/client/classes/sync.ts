import { Events } from './index';

class Sync {
  private readonly actionsToUnregister: Set<string>;

  constructor() {
    this.actionsToUnregister = new Set();

    on('onResourceStop', (resourceName: string) => {
      if (GetCurrentResourceName() !== resourceName) return;
      this.actionsToUnregister.forEach(action => {
        global.exports['dg-sync'].unregisterActionHandler(action);
      });
    });
  }

  public registerActionHandler = (action: string, handler: Sync.ActionHandler) => {
    global.exports['dg-sync'].registerActionHandler(action, handler);
    this.actionsToUnregister.add(action);
  };

  public executeAction = (action: string, entity: number, ...args: unknown[]) => {
    global.exports['dg-sync'].executeAction(action, entity, ...args);
  };

  setPlayerInvincible(isEnabled: boolean) {
    Events.emitNet('auth:anticheat:native:setPlayerInvincible', isEnabled);
  }
  setPlayerVisible(isVisible: boolean) {
    Events.emitNet('auth:anticheat:native:setPlayerVisible', isVisible);
  }

  public getAllPlayerCoords = (): Record<number, Vec3> => {
    return global.exports['dg-sync'].getAllPlayerCoords();
  };

  public getPlayerCoords = (plyId: number): Vec3 => {
    return global.exports['dg-sync'].getPlayerCoords(plyId);
  };

  public onPlayerCoordsUpdate = (handler: (playerCoords: Record<number, Vec3>) => void) => {
    onNet('sync:coords:sync', handler);
  };

  public getAmountOfPlayers = () => {
    return Object.keys(this.getAllPlayerCoords()).length;
  };
}

export default {
  Sync: new Sync(),
};
