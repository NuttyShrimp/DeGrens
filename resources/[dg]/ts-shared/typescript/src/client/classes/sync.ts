import { Events } from './index';

class Sync {
  executeNative(native: string, entity: number, ...args: any[]) {
    global.exports['dg-sync'].syncExecution(native, entity, ...args);
  }
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
}

export default {
  Sync: new Sync(),
};
