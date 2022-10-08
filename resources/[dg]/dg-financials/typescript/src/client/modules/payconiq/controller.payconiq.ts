import { RPC, UI } from '@dgx/client';

UI.RegisterUICallback('phone/payconiq/get', async (_, cb) => {
  const account = await RPC.execute<IAccount>('financials:getDefaultAccount');
  if (!account) throw new Error('Could not get default account');
  const transactions = await RPC.execute('financials:server:transactions:get', {
    accountId: account.account_id,
    type: 'mobile_transaction',
  });
  cb({ data: transactions ?? [], meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/payconiq/makeTransaction', async (data, cb) => {
  const account = await RPC.execute<IAccount>('financials:getDefaultAccount');
  if (!account) throw new Error('Could not get default account');
  data.accountId = account.account_id;
  await RPC.execute('financials:server:action:mobileTransaction', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
