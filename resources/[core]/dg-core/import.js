if (GetResourceState('dg-core') == 'started') {
  global.DGCore = exports['dg-core'].GetSharedObject();
}

on('onResourceStart', res => {
  if (res == 'dg-core') {
    global.DGCore = exports['dg-core'].GetSharedObject();
  }
});
