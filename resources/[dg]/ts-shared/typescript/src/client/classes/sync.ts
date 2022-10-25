class Sync {
  executeNative(native: string, vehNetId: number, ...args: any[]) {
    global.exports['dg-sync'].SyncExecution(native, vehNetId, ...args);
  }
}

export default {
  Sync: new Sync(),
};
