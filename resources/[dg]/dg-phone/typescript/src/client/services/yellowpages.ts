import { Events, RPC, UI } from '@dgx/client';

UI.RegisterUICallback('phone/yellowpages/getList', async (data, cb) => {
  const list = await RPC.execute('dg-phone:server:yp:get');
  cb({ data: list, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/yellowpages/new', (data, cb) => {
  Events.emitNet('dg-phone:server:yp:add', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/yellowpages/remove', async (data, cb) => {
  Events.emitNet('dg-phone:server:yp:remove');
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

onNet('dg-phone:client:yp:setAd', (ad: Ad) => {
  UI.SendAppEvent('phone', {
    appName: 'yellowpages',
    action: 'setCurrentAd',
    data: ad,
  });
});

on('dg-phone:load', async () => {
  const currentAd = await RPC.execute('dg-phone:server:yp:getCurrentAd');
  UI.SendAppEvent('phone', {
    appName: 'yellowpages',
    action: 'setCurrentAd',
    data: currentAd,
  });
});
