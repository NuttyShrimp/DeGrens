import { RPC, UI } from '@dgx/client';

UI.RegisterUICallback('laptop/carboosting/getData', async (_, cb) => {
  const data = await RPC.execute<Carboosting.UIData>('carboosting:contracts:getUIData');
  cb({ data: data ?? {}, meta: { ok: !!data, message: 'Failed to get carboosting UI data' } });
});

UI.RegisterUICallback<{ toggle: boolean }>('laptop/carboosting/toggleSignedUp', async ({ toggle }, cb) => {
  const success = await RPC.execute('carboosting:contracts:toggleSignedUp', toggle);
  cb({ data: success ?? false, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback<{ id: number; type: Carboosting.DropoffType }>(
  'laptop/carboosting/accept',
  async ({ id, type }, cb) => {
    const message = await RPC.execute<string | undefined>('carboosting:contracts:accept', id, type);
    cb({ data: {}, meta: { ok: !message, message: message ?? '' } });
  }
);

UI.RegisterUICallback<{ id: number }>('laptop/carboosting/decline', async ({ id }, cb) => {
  const message = await RPC.execute<string | undefined>('carboosting:contracts:decline', id);
  cb({ data: {}, meta: { ok: !message, message: message ?? '' } });
});
