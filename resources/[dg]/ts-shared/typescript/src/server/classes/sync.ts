class Sync {
  executeNative(native: string, owner: number, netId: number, ...args: any[]) {
    emit('sync:request', native, owner, netId, ...args);
  }
  setPlayerInvincible(src: number, isEnabled: boolean) {
    global.exports['dg-auth'].SetPlayerInvincible(src, isEnabled)
  }
  setPlayerVisible(src: number, isVisible: boolean) {
    global.exports['dg-auth'].SetPlayerVisible(src, isVisible);
  }
}


export default {
  Sync: new Sync()
}
