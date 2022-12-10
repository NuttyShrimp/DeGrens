import { Events } from '@dgx/client';

RegisterNuiCallbackType('closeRadialMenu');
on('__cfx_nui:closeRadialMenu', (data: unknown, cb: (_: any) => void) => {
  SetNuiFocus(false, false);
  cb({});
});

RegisterNuiCallbackType('selectEntry');
on('__cfx_nui:selectEntry', (data: { entry: RadialMenu.ActionEntry }, cb: (_: any) => void) => {
  if (!data.entry.event) return;

  if (data.entry.type === 'client') {
    emit(data.entry.event, data.entry.data);
  } else {
    Events.emitNet(data.entry.event, data.entry.data);
  }
  cb({});
});
