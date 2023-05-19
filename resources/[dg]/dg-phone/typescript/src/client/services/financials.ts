import { RPC, UI } from '@dgx/client';

UI.RegisterUICallback('phone/debts/get', (_, cb) => {
  const debts = RPC.execute('financials:server:debts:get');
  cb({ data: debts, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/debts/pay', (data, cb) => {
  const success = RPC.execute('financials:server:debts:pay', data.id, data.percentage ?? 100);
  cb({ data: success, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/crypto/transfer', async (data, cb) => {
  const result = await RPC.execute('financials:server:crypto:transfer', data);
  cb({ data: result, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/crypto/purchase', async (data, cb) => {
  const result = await RPC.execute('financials:server:crypto:buy', data);
  cb({ data: result, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/crypto/get', async (data, cb) => {
  const result = await RPC.execute('financials:server:crypto:getInfo', data);
  cb({ data: result, meta: { ok: true, message: 'done' } });
});
