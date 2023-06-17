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

UI.RegisterUICallback('phone/notes/new', async (_, cb) => {
  const note = await RPC.execute('dg-phone:server:notes:new');
  cb({ data: note, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/save', (data: Pick<Note, 'id' | 'note' | 'title'>, cb) => {
  Events.emitNet('dg-phone:server:notes:save', { id: data.id, note: data.note, title: data.title });
  cb({ data: 'ok', meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/delete', (data: { id: number }, cb) => {
  Events.emitNet('dg-phone:server:notes:delete', data.id);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/share', (data: { id: number; type: NoteShareType }, cb) => {
  Events.emitNet('dg-phone:server:notes:share', data.id, data.type);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/notes/resolveShare', async (data: { id: number; accepted: boolean }, cb) => {
  const note = await RPC.execute<Note | string | undefined>('dg-phone:server:notes:resolve', data);
  if (!note) {
    cb({ data: {}, meta: { ok: true, message: 'done' } });
  } else if (typeof note === 'string') {
    cb({ data: {}, meta: { ok: false, message: note } });
  } else {
    cb({ data: note, meta: { ok: true, message: 'done' } });
  }
});

onNet('dg-phone:client:notes:share', (id: number) => {
  UI.SendAppEvent('phone', {
    appName: 'notes',
    action: 'share',
    data: { id },
  });
});
