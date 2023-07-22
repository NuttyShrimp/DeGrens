import { Events, RPC, UI } from '@dgx/client';

UI.RegisterUICallback('phone/justice/get', async (_, cb) => {
  const data = await RPC.execute('phone:justice:get');
  cb({ data: data, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/justice/setAvailable', async (data: { available: boolean }, cb) => {
  await RPC.execute('phone:justice:setAvailable', data.available);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback(
  'phone/justice/fine',
  async (data: { citizenid: string; amount: string; comment?: string }, cb) => {
    Events.emitNet('phone:justice:giveFine', data.citizenid, data.amount, data.comment);
    cb({ data: {}, meta: { ok: true, message: 'done' } });
  }
);
