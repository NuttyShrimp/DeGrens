import { Events, RPC, UI } from '@dgx/client';

UI.RegisterUICallback('phone/messages/get', async (data, cb) => {
  const messages = await RPC.execute('phone:messages:get', data);
  cb({ data: messages, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/messages/send', (data, cb) => {
  Events.emitNet('phone:messages:send', data);
  cb({ data: null, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/messages/set-read', (data, cb) => {
  Events.emitNet('phone:messages:setRead', data);
  cb({ data: null, meta: { ok: true, message: 'done' } });
});

onNet('phone:messages:receive', (message: string, otherPhone: string) => {
  UI.SendAppEvent('phone', {
    appName: 'messages',
    action: 'addNew',
    data: {
      message: message,
      otherPhone: otherPhone,
    },
  });
});
