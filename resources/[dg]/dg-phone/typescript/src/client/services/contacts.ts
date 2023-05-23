import { RPC, UI } from '@dgx/client';
import { getState } from './state';
import { openPhone } from './mgmt';

UI.RegisterUICallback('phone/contacts/getContacts', async (data, cb) => {
  const contacts = await RPC.execute('phone:contacts:get');
  cb({
    data: contacts,
    meta: contacts.error ? { ok: false, message: contacts.message ?? 'Unknown error' } : { ok: true, message: 'done' },
  });
});

UI.RegisterUICallback('phone/contacts/update', async (data, cb) => {
  await RPC.execute('phone:contacts:update', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/contacts/add', async (data, cb) => {
  await RPC.execute('phone:contacts:add', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/contacts/delete', async (data, cb) => {
  await RPC.execute('phone:contacts:delete', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

on('phone:contacts:shareNumber:accept', (data: { phone: string }) => {
  UI.SendAppEvent('phone', {
    appName: 'contacts',
    action: 'openNewContactModal',
    data: {
      phone: data.phone,
    },
  });
  if (getState('state') == 0) {
    openPhone();
  }
});
