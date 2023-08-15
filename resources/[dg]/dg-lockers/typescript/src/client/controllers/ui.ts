import { Events, UI } from '@dgx/client';

UI.RegisterUICallback('lockers/open', (data: { id: string }, cb) => {
  Events.emitNet('lockers:server:open', data.id);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('lockers/changePassword', (data: { id: string }, cb) => {
  Events.emitNet('lockers:server:changePassword', data.id);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('lockers/transferOwnership', (data: { id: string }, cb) => {
  Events.emitNet('lockers:server:transferOwnership', data.id);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
