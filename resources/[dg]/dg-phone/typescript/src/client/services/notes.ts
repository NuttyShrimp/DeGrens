import { Events, RPC, UI } from '@dgx/client';
import { setState } from './state';

UI.RegisterUICallback('phone/notes/enterEdit', (data, cb) => {
  setState('inputFocused', data.edit);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/get', async (_, cb) => {
  const notes = await RPC.execute('dg-phone:server:notes:get');
  cb({ data: notes ?? [], meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/new', async (data, cb) => {
  const note = await RPC.execute('dg-phone:server:notes:new', data);
  cb({ data: note, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/save', (data, cb) => {
  Events.emitNet('dg-phone:server:notes:save', data);
  cb({ data: 'ok', meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/delete', (data, cb) => {
  Events.emitNet('dg-phone:server:notes:delete', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/share', (data, cb) => {
  Events.emitNet('dg-phone:server:notes:share', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/resolveShare', async (data, cb) => {
  const id = await RPC.execute('dg-phone:server:notes:resolve', data);
  if (!id) {
    cb({ data: {}, meta: { ok: true, message: 'done' } });
  } else if (typeof id === 'string') {
    cb({ data: {}, meta: { ok: false, message: id } });
  } else {
    cb({ data: id, meta: { ok: true, message: 'done' } });
  }
});

onNet('dg-phone:client:notes:share', (note: any, id: number) => {
  UI.SendAppEvent('phone', {
    appName: 'notes',
    action: 'share',
    data: { id: id, note: note },
  });
});
