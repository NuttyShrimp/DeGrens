import { Events, UI } from '@dgx/client';

UI.RegisterUICallback('event/ctm/restockWeapon', (data: { type: string }, cb) => {
  Events.emitNet('event:ctm:restockWeapon', data.type, 'weapon');
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('event/ctm/restockAmmo', (data: { type: string }, cb) => {
  Events.emitNet('event:ctm:restockWeapon', data.type, 'ammo');
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
