import { RPC } from './index';

class Sync {
  executeNative(native: string, vehNetId: number, ...args: any[]) {
    global.exports['dg-sync'].SyncExecution(native, vehNetId, ...args);
  }
  getScopeInfo(): Promise<{ current: Sync.ScopePlayer[]; recent: Sync.ScopePlayer[] } | null> {
    return RPC.execute('sync:scopes:get');
  }
}

export default {
  Sync: new Sync(),
};
