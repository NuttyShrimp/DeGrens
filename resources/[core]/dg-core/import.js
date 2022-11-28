if (GetResourceState('dg-core') == 'started') {
  (async () => {
    while (exports?.['dg-core']?.GetSharedObject === undefined) {
      await new Promise(r => setTimeout(r, 100));
    }
  })();
  global.DGCore = exports['dg-core'].GetSharedObject();
}

on('onResourceStart', async res => {
  if (res == 'dg-core') {
    while (exports?.['dg-core']?.GetSharedObject === undefined) {
      await new Promise(r => setTimeout(r, 100));
    }
    global.DGCore = exports['dg-core'].GetSharedObject();
  }
});
