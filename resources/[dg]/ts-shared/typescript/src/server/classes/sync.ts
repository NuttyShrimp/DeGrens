class Sync {
  executeNative(native: string, entity: number, ...args: any[]) {
    global.exports['dg-sync'].SyncExecution(native, entity, ...args);
  }
  setPlayerInvincible(src: number, isEnabled: boolean) {
    global.exports['dg-auth'].SetPlayerInvincible(src, isEnabled);
  }
  setPlayerVisible(src: number, isVisible: boolean) {
    global.exports['dg-auth'].SetPlayerVisible(src, isVisible);
  }
}

export default {
  Sync: new Sync(),
};
