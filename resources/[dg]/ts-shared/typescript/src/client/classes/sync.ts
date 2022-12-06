import { RPC, Events } from './index';

class Sync {
  executeNative(native: string, entity: number, ...args: any[]) {
    global.exports['dg-sync'].SyncExecution(native, entity, ...args);
  }
  setPlayerInvincible(isEnabled: boolean) {
    Events.emitNet('auth:anticheat:native:setPlayerInvincible', isEnabled);
  }
  setPlayerVisible(isVisible: boolean) {
    Events.emitNet('auth:anticheat:native:setPlayerVisible', isVisible);
  }
  getScopeInfo(): Promise<{ current: Sync.ScopePlayer[]; recent: Sync.ScopePlayer[] } | null> {
    return RPC.execute('sync:scopes:get');
  }
}

export default {
  Sync: new Sync(),
};
