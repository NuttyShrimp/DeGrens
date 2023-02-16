import { Events } from '@dgx/client';
import { handleRadialMenuClose } from 'services/radialmenu';

RegisterNuiCallbackType('closeRadialMenu');
on('__cfx_nui:closeRadialMenu', (_: unknown, cb: (_: any) => void) => {
  handleRadialMenuClose();
  cb({});
});

RegisterNuiCallbackType('selectEntry');
on('__cfx_nui:selectEntry', (data: { entry: RadialMenu.ActionEntry }, cb: (_: any) => void) => {
  if (!data.entry.event) return;

  switch (data.entry.type) {
    case 'client':
      emit(data.entry.event, data.entry.data);
      break;
    case 'server':
      emitNet(data.entry.event, data.entry.data);
      break;
    case 'dgxClient':
      Events.emit(data.entry.event, data.entry.data);
      break;
    case 'dgxServer':
      Events.emitNet(data.entry.event, data.entry.data);
      break;
  }

  cb({});
});
