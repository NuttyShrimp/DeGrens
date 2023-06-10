import { Events, RPC, UI } from '@dgx/client';

UI.RegisterUICallback('phone/justice/get', async (_, cb) => {
  const data = await RPC.execute('phone:justice:get');
  cb({ data: data, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/justice/setAvailable', async (data, cb) => {
  Events.emitNet('phone:justice:setAvailable', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/justice/fine', async (data, cb) => {
  Events.emitNet('phone:justice:giveFine', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
