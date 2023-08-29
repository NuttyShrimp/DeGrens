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
  if (!account) {
    console.error('Could not get default account');
    cb({ data: false, meta: { ok: true, message: 'done' } });
    return;
  }

  data.accountId = account.account_id;
  const success = await RPC.execute<boolean>('financials:server:action:mobileTransaction', data);
  cb({ data: success, meta: { ok: true, message: 'done' } });
});
