import { Events, Storage, UI } from '@dgx/client';

let initial = true;

Events.onNet('dg-misc:openConfigMenu', () => {
  UI.openApplication('configmenu');
});

on('dg-ui:loadData', () => {
  UI.SendAppEvent('configmenu', {
    action: 'load',
    data: Storage.getValue('dg-config') ?? {},
  });
});

UI.RegisterUICallback('configmenu/save', (data, cb) => {
  if (!data.data) return;
  Storage.setValue('dg-config', data.data);
  if (initial) {
    setTimeout(() => {
      Events.emit('dg-misc:configChanged', data.data);
    }, 10000);
    initial = false;
  } else {
    Events.emit('dg-misc:configChanged', data.data);
  }
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

global.exports('getPreferences', () => {
  const config = Storage.getValue('dg-config');
  return config ?? {};
});
